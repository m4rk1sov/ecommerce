def test_neo4j_graph_integrity(neo4j_driver):
    q1 = """
    MERGE (u:User {id: 'u1'})
    MERGE (p:Product {id: 'p10'})
    MERGE (u)-[:VIEWED]->(p)
    """

    q2 = """
    MATCH (u:User {id:'u1'})-[r:VIEWED]->(p:Product {id:'p10'})
    RETURN count(r) AS c
    """

    with neo4j_driver.session() as s:
        s.run(q1)
        result = s.run(q2).single()

    assert result["c"] == 1
