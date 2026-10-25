from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert data["cachedActualsCount"] > 0
    assert data["cachedForecastsCount"] > 0


def test_metadata_endpoint(client: TestClient):
    resp = client.get("/api/metadata")
    assert resp.status_code == 200
    data = resp.json()
    assert data["datasetStart"] == "2026-01-01"
    assert data["datasetEnd"] == "2026-01-31"
    assert data["fuelType"] == "WIND"
    assert "marketRulesSummary" in data


def test_forecast_endpoint_valid_date(client: TestClient):
    resp = client.get("/api/forecast?delivery_date=2026-01-15&cutoff_rule=DA_AUCTION_1100")
    assert resp.status_code == 200
    data = resp.json()
    assert data["deliveryDate"] == "2026-01-15"
    assert len(data["intervals"]) == 48
    assert "summary" in data
    assert data["summary"]["totalExpectedRecords"] == 48
    assert data["summary"]["coveragePercent"] > 0


def test_forecast_endpoint_invalid_date_regex(client: TestClient):
    # Delivery date outside Jan 2026 should be rejected by regex validation
    resp = client.get("/api/forecast?delivery_date=2026-02-15")
    assert resp.status_code == 422


def test_accuracy_endpoint(client: TestClient):
    resp = client.get("/api/accuracy?cutoff_rule=DA_AUCTION_1100")
    assert resp.status_code == 200
    data = resp.json()
    assert "overallMetrics" in data
    metrics = data["overallMetrics"]
    assert metrics["sampleSize"] == 1488
    assert metrics["maeMW"] > 0
    assert metrics["rmseMW"] > 0
    assert "settlementPeriodProfile" in data
    assert len(data["settlementPeriodProfile"]) == 48
    assert "dailyTrends" in data
    assert len(data["dailyTrends"]) == 31
    assert "largestMisses" in data
    assert "errorDistribution" in data


def test_forecast_evolution_endpoint(client: TestClient):
    resp = client.get("/api/forecast-evolution?delivery_date=2026-01-15&periods=16,24,36,44")
    assert resp.status_code == 200
    data = resp.json()
    assert data["deliveryDate"] == "2026-01-15"
    assert len(data["deliveryPeriodEvolution"]) == 4
    for item in data["deliveryPeriodEvolution"]:
        assert len(item["vintages"]) > 0


def test_procurement_scenario_endpoint(client: TestClient):
    payload = {
        "deliveryDate": "2026-01-15",
        "assumedDemandMW": 32000.0,
        "assumedNonWindMW": 14000.0,
        "reserveMarginMW": 2000.0
    }
    resp = client.post("/api/procurement/scenario", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["deliveryDate"] == "2026-01-15"
    assert len(data["intervals"]) == 48
    assert "summary" in data
    assert data["summary"]["avgNetResidualForecastMW"] > 0
    assert "disclaimer" in data


def test_procurement_scenario_invalid_demand(client: TestClient):
    # Demand below minimum 1000 MW
    payload = {
        "deliveryDate": "2026-01-15",
        "assumedDemandMW": 500.0,
        "assumedNonWindMW": 14000.0,
        "reserveMarginMW": 2000.0
    }
    resp = client.post("/api/procurement/scenario", json=payload)
    assert resp.status_code == 422
