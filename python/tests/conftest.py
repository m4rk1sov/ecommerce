import pytest
import requests

BASE = "http://localhost:8080/api/v1"

@pytest.fixture(scope="session")
def token():
    payload = {"email": "user1@example.com", "password": "password123"}
    r = requests.post(f"{BASE}/auth/login", json=payload)
    return r.json()["token"]

@pytest.fixture(scope="session")
def headers(token):
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def base():
    return BASE
