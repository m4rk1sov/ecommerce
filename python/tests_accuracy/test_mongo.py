def test_mongo_user_history(mongo_client):
    col = mongo_client["ecommerce"]["history"]

    sample = {
        "user_id": "u1",
        "product_id": "p10",
        "event": "view"
    }

    col.insert_one(sample)
    result = col.find_one({"user_id": "u1", "product_id": "p10"})

    assert result["event"] == "view"
