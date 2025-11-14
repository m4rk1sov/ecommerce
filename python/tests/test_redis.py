import redis

def test_redis_cache():
    r = redis.Redis()
    r.set("key", "value")
    assert r.get("key") == b"value"
