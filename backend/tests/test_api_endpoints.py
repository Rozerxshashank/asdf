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


def test_invalid_cutoff_returns_400(client: TestClient):
    """Ensure invalid custom cutoff returns 400 Bad Request, not 500 or fallback."""
    resp = client.get("/api/forecast?delivery_date=2026-01-15&cutoff_rule=gibberish-string")
    assert resp.status_code == 400
    assert "Invalid cutoff parameter" in resp.json()["detail"]


def test_naive_cutoff_returns_400(client: TestClient):
    """Ensure naive cutoff timestamp without timezone returns 400 Bad Request."""
    resp = client.get("/api/forecast?delivery_date=2026-01-15&cutoff_rule=2026-01-14T11:00:00")
    assert resp.status_code == 400
    assert "explicit timezone" in resp.json()["detail"]


def test_accuracy_endpoint_includes_squared_pearson_and_predictive_r2(client: TestClient):
    """Verify accuracy hub returns both squaredPearsonR2 and predictiveR2."""
    resp = client.get("/api/accuracy?cutoff_rule=DA_AUCTION_1100")
    assert resp.status_code == 200
    metrics = resp.json()["overallMetrics"]
    assert "squaredPearsonR2" in metrics
    assert "predictiveR2" in metrics
    assert metrics["squaredPearsonR2"] is not None
    assert metrics["predictiveR2"] is not None
    assert metrics["squaredPearsonR2"] > metrics["predictiveR2"]  # Due to positive mean bias


def test_evolution_endpoint_with_cutoff_classification(client: TestClient):
    """Verify forecast evolution endpoint returns cutoff metadata and vintage categories."""
    resp = client.get("/api/forecast-evolution?delivery_date=2026-01-15&cutoff_rule=DA_AUCTION_1100&periods=16")
    assert resp.status_code == 200
    data = resp.json()
    assert data["cutoffRule"] == "DA_AUCTION_1100"
    assert data["cutoffTime"] is not None
    assert len(data["deliveryPeriodEvolution"]) == 1
    p16 = data["deliveryPeriodEvolution"][0]
    assert p16["decisionForecastMW"] is not None
    for v in p16["vintages"]:
        assert "isAvailableAtCutoff" in v
        assert "vintageCategory" in v

