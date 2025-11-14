import requests

def test_invalid_request(base):
    r = requests.post(f"{base}/auth/login", json={})
    assert r.status_code == 400
