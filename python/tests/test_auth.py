import requests


def test_registration(base):
    payload_register = {
        "email": "test@mail.com",
        "username": "test_user",
        "password": "12345678",
        "firstName": "test1",
        "lastName": "test2",
    }

    r = requests.post(f"{base}/auth/register", json=payload_register)
    assert r.status_code == 201


def test_login(base):
    payload_login = {
        "email": "test@mail.com",
        "password": "12345678"
    }
    r = requests.post(f"{base}/auth/login", json=payload_login)
    assert r.status_code == 200
    assert "token" in r.json()
