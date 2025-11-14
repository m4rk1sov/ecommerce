import pytest
from pymongo import MongoClient
from neo4j import GraphDatabase

# Adjust these if your containers run on different ports
MONGO_URL = "mongodb://localhost:27017"
NEO4J_URL = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASS = "password"

@pytest.fixture(scope="session")
def mongo_client():
    client = MongoClient(
        "mongodb://admin:password@localhost:27017/ecommerce?authSource=admin"
    )
    yield client
    client.close()

@pytest.fixture(scope="session")
def neo4j_driver():
    driver = GraphDatabase.driver(NEO4J_URL, auth=(NEO4J_USER, NEO4J_PASS))
    yield driver
    driver.close()
