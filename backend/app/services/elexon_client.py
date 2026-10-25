import asyncio
import logging
from typing import Dict, Any, List, Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class ElexonClient:
    """Asynchronous client for interacting with the Elexon BMRS Open Insights API."""

    def __init__(self):
        self.base_url = settings.ELEXON_BASE_URL
        self.timeout = settings.ELEXON_TIMEOUT_SECONDS
        self.max_retries = settings.ELEXON_MAX_RETRIES
        self.backoff = settings.ELEXON_RETRY_BACKOFF

    async def ping_upstream(self) -> bool:
        """Check if upstream Elexon API is responsive."""
        url = f"{self.base_url}/datasets/FUELHH?settlementDateFrom=2026-01-01&settlementDateTo=2026-01-01&fuelType=WIND"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, headers={"User-Agent": "WindLens-HealthCheck/1.0"})
                return resp.status_code == 200
        except Exception as e:
            logger.warning("Upstream ping failed: %s", e)
            return False

    async def fetch_fuelhh_chunk(
        self,
        start_date: str,
        end_date: str,
        fuel_type: str = "WIND"
    ) -> List[Dict[str, Any]]:
        """Fetch actual generation chunk from FUELHH dataset (max 7 days per call)."""
        url = f"{self.base_url}/datasets/FUELHH"
        params = {
            "settlementDateFrom": start_date,
            "settlementDateTo": end_date,
            "fuelType": fuel_type
        }
        headers = {"User-Agent": "WindLens-Client/1.0", "Accept": "application/json"}

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data.get("data", [])
                    elif resp.status_code == 429:
                        logger.warning("Rate limited by Elexon API. Retrying in %ss...", self.backoff * attempt)
                        await asyncio.sleep(self.backoff * attempt)
                    else:
                        logger.error("Elexon API error %s: %s", resp.status_code, resp.text)
                        break
            except Exception as e:
                logger.warning("Attempt %d failed for FUELHH: %s", attempt, e)
                if attempt < self.max_retries:
                    await asyncio.sleep(self.backoff * attempt)
                else:
                    raise e
        return []

    async def fetch_windfor_stream_chunk(
        self,
        publish_from: str,
        publish_to: str
    ) -> List[Dict[str, Any]]:
        """Fetch forecast stream chunk from WINDFOR dataset."""
        url = f"{self.base_url}/datasets/WINDFOR/stream"
        params = {
            "publishDateTimeFrom": publish_from,
            "publishDateTimeTo": publish_to
        }
        headers = {"User-Agent": "WindLens-Client/1.0", "Accept": "application/json"}

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    if resp.status_code == 200:
                        return resp.json()
                    elif resp.status_code == 429:
                        logger.warning("Rate limited by Elexon API. Retrying in %ss...", self.backoff * attempt)
                        await asyncio.sleep(self.backoff * attempt)
                    else:
                        logger.error("Elexon WINDFOR API error %s: %s", resp.status_code, resp.text)
                        break
            except Exception as e:
                logger.warning("Attempt %d failed for WINDFOR: %s", attempt, e)
                if attempt < self.max_retries:
                    await asyncio.sleep(self.backoff * attempt)
                else:
                    raise e
        return []


elexon_client = ElexonClient()
