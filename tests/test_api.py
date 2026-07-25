from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online", "message": "Bioinformatics API is running."}

def test_hamming_distance():
    response = client.post(
        "/api/v1/alignments/hamming-distance",
        json={"seq1": "ATGC", "seq2": "ATCC"}
    )
    assert response.status_code == 200
    assert response.json()["distance"] == 1
    assert response.json()["status"] == "success"

def test_complement():
    response = client.post(
        "/api/v1/genetics/complement",
        json={"sequence": "ATGC"}
    )
    assert response.status_code == 200
    assert response.json()["complement"] == "TACG"
    assert response.json()["status"] == "success"
