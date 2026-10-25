import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class DataService:
    """Manages ingestion, caching, filtering, and forecast alignment."""

    def __init__(self):
        self.data_dir = settings.DATA_DIR
        self.actuals_file = self.data_dir / settings.ACTUALS_CACHE_FILE
        self.forecasts_file = self.data_dir / settings.FORECASTS_CACHE_FILE

        self._actuals_cache: List[Dict[str, Any]] = []
        self._forecasts_cache: List[Dict[str, Any]] = []
        self._actuals_by_start: Dict[str, Dict[str, Any]] = {}
        self._forecasts_by_start: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        
        self.last_cache_refresh: Optional[str] = None
        self.is_loaded: bool = False

        self.load_cache()

    def load_cache(self) -> bool:
        """Load packaged, validated January 2026 datasets from disk."""
        try:
            if not self.actuals_file.exists() or not self.forecasts_file.exists():
                logger.warning("Cache files missing at %s", self.data_dir)
                return False

            with open(self.actuals_file, "r") as f:
                act_data = json.load(f)
                self._actuals_cache = act_data.get("records", [])
                self.last_cache_refresh = act_data.get("ingestionTimestamp")

            with open(self.forecasts_file, "r") as f:
                fc_data = json.load(f)
                self._forecasts_cache = fc_data.get("records", [])

            # Index actuals by standardized startTime
            self._actuals_by_start.clear()
            for rec in self._actuals_cache:
                st = self._standardize_iso(rec.get("startTime"))
                if st:
                    self._actuals_by_start[st] = rec

            # Index forecasts by standardized startTime
            self._forecasts_by_start.clear()
            for rec in self._forecasts_cache:
                st = self._standardize_iso(rec.get("startTime"))
                if st:
                    self._forecasts_by_start[st].append(rec

            )
            # Sort each vintage list by publishTime ascending
            for st in self._forecasts_by_start:
                self._forecasts_by_start[st].sort(
                    key=lambda x: self._parse_iso_to_utc(x.get("publishTime")) or datetime.min.replace(tzinfo=timezone.utc)
                )

            self.is_loaded = True
            logger.info(
                "Successfully loaded cache: %d actuals, %d forecasts",
                len(self._actuals_cache),
                len(self._forecasts_cache)
            )
            return True
        except Exception as e:
            logger.error("Failed to load cache: %s", e)
            return False

    @staticmethod
    def _standardize_iso(ts_str: Optional[str]) -> Optional[str]:
        """Convert any ISO timestamp to canonical YYYY-MM-DDTHH:MM:SSZ UTC string."""
        if not ts_str:
            return None
        try:
            dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            dt_utc = dt.astimezone(timezone.utc)
            return dt_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return ts_str

    @staticmethod
    def _parse_iso_to_utc(ts_str: Optional[str]) -> Optional[datetime]:
        """Parse ISO string into a timezone-aware UTC datetime."""
        if not ts_str:
            return None
        try:
            dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
            return dt.astimezone(timezone.utc)
        except Exception:
            return None

    def get_actuals_count(self) -> int:
        return len(self._actuals_cache)

    def get_forecasts_count(self) -> int:
        return len(self._forecasts_cache)

    @staticmethod
    def resolve_decision_cutoff(delivery_date: str, cutoff_rule: str = "DA_AUCTION_1100") -> Tuple[datetime, str]:
        """Resolve the decision cutoff timestamp based on delivery date and market rule.
        
        UK Day-Ahead Wholesale Market Rules:
        - Delivery occurs across 48 half-hour settlement periods on Day D (00:00 to 24:00 UTC/GMT).
        - EPEX SPOT / Nord Pool UK Day-Ahead Auction gate closes on Day (D - 1).
        - Standard auction deadline is 11:00 UTC (or 12:00 UTC) on Day (D - 1).
        
        Strict validation:
        - Rejects invalid custom ISO strings with ValueError (no silent fallback).
        - Requires explicit timezone information (naive timestamps rejected).
        """
        deliv_dt = datetime.strptime(delivery_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        d_minus_one = deliv_dt - timedelta(days=1)

        rule_clean = (cutoff_rule or "").strip()

        if rule_clean == "DA_AUCTION_1100":
            cutoff_dt = d_minus_one.replace(hour=11, minute=0, second=0, microsecond=0)
            desc = "Day-Ahead Auction Gate (11:00 UTC on D-1)"
            return cutoff_dt, desc
        elif rule_clean == "DA_AUCTION_1200":
            cutoff_dt = d_minus_one.replace(hour=12, minute=0, second=0, microsecond=0)
            desc = "Day-Ahead Auction Late Gate (12:00 UTC on D-1)"
            return cutoff_dt, desc
        elif rule_clean == "INTRADAY_2000":
            cutoff_dt = d_minus_one.replace(hour=20, minute=0, second=0, microsecond=0)
            desc = "Evening Intraday Update (20:00 UTC on D-1)"
            return cutoff_dt, desc
        elif rule_clean == "INTRADAY_0000":
            cutoff_dt = deliv_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            desc = "Midnight Day-of-Delivery Gate (00:00 UTC on D)"
            return cutoff_dt, desc
        
        # Custom cutoff validation: require non-empty string and explicit timezone
        if not rule_clean:
            raise ValueError("Cutoff rule cannot be empty.")

        # Check for explicit timezone indicator ('Z', '+', or '-' after position 10)
        has_tz = rule_clean.endswith("Z") or "+" in rule_clean or (len(rule_clean) > 10 and "-" in rule_clean[10:])
        if not has_tz:
            raise ValueError(
                f"Custom cutoff '{cutoff_rule}' must include explicit timezone information (e.g., 'Z' or '+00:00'). "
                "Naive timestamps without timezone offsets are rejected to preserve strict auditability."
            )

        try:
            parsed = datetime.fromisoformat(rule_clean.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                raise ValueError("Parsed timestamp is naive.")
            cutoff_dt = parsed.astimezone(timezone.utc)
            desc = f"Custom Cutoff ({cutoff_dt.strftime('%Y-%m-%d %H:%M UTC')})"
            return cutoff_dt, desc
        except Exception as e:
            if isinstance(e, ValueError) and "Custom cutoff" in str(e):
                raise
            raise ValueError(
                f"Invalid custom cutoff timestamp '{cutoff_rule}'. Expected a valid ISO-8601 string "
                f"with explicit timezone (e.g., '2026-01-14T11:00:00Z'): {str(e)}"
            )

    def get_forecast_for_interval(
        self,
        start_time_iso: str,
        cutoff_dt: datetime
    ) -> Tuple[Optional[float], Optional[str], bool]:
        """Select latest valid forecast vintage where publishTime <= cutoff_dt.
        
        Strict rule:
        - NEVER substitute a forecast published after cutoff_dt (prevents look-ahead bias).
        - Matching convention: WINDFOR stream publishes forecasts at hourly target times (:00).
          If an exact 30-min timestamp is not found, the prevailing hourly forecast for that clock hour
          is matched, preserving ESO hourly forecast blocks to GB half-hourly settlement periods.
        - Returns (forecast_mw, publish_time_iso, is_available).
        """
        st = self._standardize_iso(start_time_iso)
        vintages = self._forecasts_by_start.get(st, [])
        if not vintages and st:
            # Fall back to hour-start (hourly ESO forecast applies to both settlement periods in the hour)
            st_dt = self._parse_iso_to_utc(st)
            if st_dt:
                hour_st = st_dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")
                vintages = self._forecasts_by_start.get(hour_st, [])

        if not vintages:
            return None, None, False

        # Filter candidates published before or at cutoff
        valid_candidates = []
        for v in vintages:
            pub_dt = self._parse_iso_to_utc(v.get("publishTime"))
            if pub_dt and pub_dt <= cutoff_dt:
                valid_candidates.append((pub_dt, v))

        if not valid_candidates:
            return None, None, False

        # Select the latest valid vintage
        valid_candidates.sort(key=lambda x: x[0])
        best_dt, best_rec = valid_candidates[-1]
        
        gen = best_rec.get("generation")
        pub_iso = self._standardize_iso(best_rec.get("publishTime"))
        return float(gen) if gen is not None else None, pub_iso, True

    def get_day_intervals(
        self,
        delivery_date: str,
        cutoff_dt: datetime
    ) -> List[Dict[str, Any]]:
        """Generate the full 48 settlement periods for a delivery date and evaluate forecast vs actual."""
        deliv_dt = datetime.strptime(delivery_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        intervals = []

        for period in range(1, 49):
            # Each period is 30 minutes: period 1 is 00:00 to 00:30
            start_offset_mins = (period - 1) * 30
            end_offset_mins = period * 30
            start_dt = deliv_dt + timedelta(minutes=start_offset_mins)
            end_dt = deliv_dt + timedelta(minutes=end_offset_mins)

            st_iso = start_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            et_iso = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

            # Actual generation
            act_rec = self._actuals_by_start.get(st_iso)
            act_gen = float(act_rec.get("generation")) if act_rec and act_rec.get("generation") is not None else None

            # Forecast generation using anti-lookahead selection rule
            fc_gen, pub_iso, is_avail = self.get_forecast_for_interval(st_iso, cutoff_dt)

            # Error metrics for interval
            err = None
            abs_err = None
            signed_gap = None
            if fc_gen is not None and act_gen is not None:
                err = round(fc_gen - act_gen, 1)
                abs_err = round(abs(fc_gen - act_gen), 1)
                signed_gap = err

            intervals.append({
                "settlementDate": delivery_date,
                "settlementPeriod": period,
                "startTime": st_iso,
                "endTime": et_iso,
                "actualGeneration": act_gen,
                "forecastGeneration": fc_gen,
                "publishTime": pub_iso,
                "forecastAvailableByCutoff": is_avail,
                "forecastError": err,
                "absoluteError": abs_err,
                "signedGap": signed_gap
            })

        return intervals

    def get_all_matched_records(self, cutoff_rule: str = "DA_AUCTION_1100") -> List[Dict[str, Any]]:
        """Retrieve all matched actual-forecast records across the entire January 2026 dataset."""
        all_records = []
        # January 2026: 2026-01-01 to 2026-01-31
        start_date = datetime(2026, 1, 1, tzinfo=timezone.utc)
        for d in range(31):
            curr_date = (start_date + timedelta(days=d)).strftime("%Y-%m-%d")
            cutoff_dt, _ = self.resolve_decision_cutoff(curr_date, cutoff_rule)
            day_intervals = self.get_day_intervals(curr_date, cutoff_dt)
            all_records.extend(day_intervals)
        return all_records

    def get_forecast_evolution_for_date(
        self,
        delivery_date: str,
        settlement_periods: Optional[List[int]] = None,
        cutoff_dt: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve historical vintage progression for selected settlement periods on a delivery date.
        
        Explicitly distinguishes between:
        1. Pre-cutoff vintages available at original decision time (publishTime <= cutoff_dt).
        2. Post-cutoff revisions published after decision cutoff (retrospective updates).
        """
        if settlement_periods is None:
            # Default to peak evening and afternoon periods: 16 (07:30), 24 (11:30), 36 (17:30), 44 (21:30)
            settlement_periods = [16, 24, 36, 44]

        deliv_dt = datetime.strptime(delivery_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        result = []

        for p in settlement_periods:
            start_offset_mins = (p - 1) * 30
            st_dt = deliv_dt + timedelta(minutes=start_offset_mins)
            st_iso = st_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

            act_rec = self._actuals_by_start.get(st_iso)
            act_gen = float(act_rec.get("generation")) if act_rec and act_rec.get("generation") is not None else None

            vintages_raw = self._forecasts_by_start.get(st_iso, [])
            if not vintages_raw:
                hour_st = st_dt.replace(minute=0, second=0, microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")
                vintages_raw = self._forecasts_by_start.get(hour_st, [])
            
            vintages_clean = []
            decision_fc = None
            decision_pub = None
            post_cutoff_count = 0

            for v in vintages_raw:
                pub_iso = self._standardize_iso(v.get("publishTime"))
                pub_dt = self._parse_iso_to_utc(pub_iso)
                gen = float(v.get("generation")) if v.get("generation") is not None else None
                if pub_dt and gen is not None:
                    lead_hours = round((st_dt - pub_dt).total_seconds() / 3600.0, 1)
                    
                    is_pre_cutoff = True
                    if cutoff_dt is not None:
                        is_pre_cutoff = (pub_dt <= cutoff_dt)
                    
                    category = "PRE_CUTOFF_DECISION" if is_pre_cutoff else "POST_CUTOFF_REVISION"
                    if not is_pre_cutoff:
                        post_cutoff_count += 1
                    elif cutoff_dt is not None:
                        # Candidate for decision forecast (latest before cutoff)
                        decision_fc = gen
                        decision_pub = pub_iso

                    vintages_clean.append({
                        "publishTime": pub_iso,
                        "leadTimeHours": lead_hours,
                        "generation": gen,
                        "isAvailableAtCutoff": is_pre_cutoff,
                        "vintageCategory": category
                    })

            result.append({
                "settlementPeriod": p,
                "startTime": st_iso,
                "actualMW": act_gen,
                "decisionForecastMW": decision_fc,
                "decisionPublishTime": decision_pub,
                "postCutoffRevisionCount": post_cutoff_count,
                "vintages": vintages_clean
            })

        return result


data_service = DataService()
