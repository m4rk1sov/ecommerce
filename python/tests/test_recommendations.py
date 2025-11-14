import requests

def test_recommendations(base, headers):
    r = requests.get(f"{base}/recommendations", headers=headers)
    assert r.status_code == 200
