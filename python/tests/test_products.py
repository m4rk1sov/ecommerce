import requests

def test_add_product(base, headers):
    product = {"name": "Laptop", "price": 500, "tags": ["tech"]}
    r = requests.post(f"{base}/admin/products", json=product, headers=headers)
    assert r.status_code == 201

def test_search_products(base):
    r = requests.get(f"{base}/products/search?q=Laptop")
    assert r.status_code == 200
    assert len(r.json()) > 0
