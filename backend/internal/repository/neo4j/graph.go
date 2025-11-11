package neo4j

import (
	"context"
	"errors"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type GraphRepository struct {
	driver neo4j.DriverWithContext
}

func NewGraphRepository(driver neo4j.DriverWithContext) *GraphRepository {
	return &GraphRepository{
		driver: driver,
	}
}

func (r *GraphRepository) CreateUserProductRelation(
	ctx context.Context,
	userID, productID bson.ObjectID,
	relType string,
	weight float64,
) error {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
		MERGE (u:User {id: $userID})
        MERGE (p:Product {id: $productID})
        MERGE (u)-[r:INTERACTED {type: $relType}]->(p)
        ON CREATE SET r.weight = $weight, r.count = 1, r.created_at = timestamp()
        ON MATCH SET r.weight = r.weight + $weight, r.count = r.count + 1, r.updated_at = timestamp()
	`

	_, err = session.Run(ctx, query, map[string]interface{}{
		"userID":    userID.Hex(),
		"productID": productID.Hex(),
		"relType":   relType,
		"weight":    weight,
	})

	return err
}

func (r *GraphRepository) GetUserProductRelations(ctx context.Context, userID bson.ObjectID) ([]entity.Interaction, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
		MATCH (u:User {id: $userID})-[r:INTERACTED]->(p:Product)
		RETURN p.id AS productID, r.Type as type, r.weight AS weight, r.updated_at AS timestamp
		ORDER BY r.updated_at DESC
	`

	result, err := session.Run(ctx, query, map[string]interface{}{
		"userID": userID.Hex(),
	})
	if err != nil {
		return nil, err
	}

	var interactions []entity.Interaction
	for result.Next(ctx) {
		record := result.Record()

		productIDStr, _ := record.Get("productID")
		productID, _ := bson.ObjectIDFromHex(productIDStr.(string))

		interactionType, _ := record.Get("type")
		weight, _ := record.Get("weight")

		interactions = append(interactions, entity.Interaction{
			UserID:    userID,
			ProductID: productID,
			Type:      entity.InteractionType(interactionType.(string)),
			Weight:    weight.(float64),
		})
	}
	return interactions, result.Err()
}

func (r *GraphRepository) FindSimilarUsers(ctx context.Context, userID bson.ObjectID, limit int) ([]entity.UserSimilarity, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	// Collaborative filtering: find users who interacted with similar products
	query := `
        MATCH (u1:User {id: $userID})-[r1:INTERACTED]->(p:Product)<-[r2:INTERACTED]-(u2:User)
        WHERE u1 <> u2
        WITH u2,
             SUM(r1.weight * r2.weight) AS similarity,
             COUNT(DISTINCT p) AS commonProducts
        WHERE commonProducts >= 3
        RETURN u2.id AS userID2, similarity
        ORDER BY similarity DESC
        LIMIT $limit
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"userID": userID.Hex(),
		"limit":  limit,
	})
	if err != nil {
		return nil, err
	}

	var similarities []entity.UserSimilarity
	for result.Next(ctx) {
		record := result.Record()

		userID2Str, _ := record.Get("userID2")
		userID2, _ := bson.ObjectIDFromHex(userID2Str.(string))

		similarity, _ := record.Get("similarity")

		similarities = append(similarities, entity.UserSimilarity{
			UserID1:    userID,
			UserID2:    userID2,
			Similarity: similarity.(float64),
		})
	}

	return similarities, result.Err()
}

func (r *GraphRepository) GetCollaborativeRecommendations(
	ctx context.Context,
	userID bson.ObjectID,
	limit int,
) ([]bson.ObjectID, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
        // Find similar users
        MATCH (u1:User {id: $userID})-[r1:INTERACTED]->(p1:Product)<-[r2:INTERACTED]-(u2:User)
        WHERE u1 <> u2
        WITH u2, SUM(r1.weight * r2.weight) AS similarity
        ORDER BY similarity DESC
        LIMIT 10
        
        // Get products liked by similar users but not by target user
        MATCH (u2)-[r:INTERACTED]->(p:Product)
        WHERE NOT EXISTS {
            MATCH (u1)-[:INTERACTED]->(p)
        }
        WITH p, SUM(r.weight * similarity) AS score
        RETURN p.id AS productID, score
        ORDER BY score DESC
        LIMIT $limit
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"userID": userID.Hex(),
		"limit":  limit,
	})
	if err != nil {
		return nil, err
	}

	var productIDs []bson.ObjectID
	for result.Next(ctx) {
		record := result.Record()
		productIDStr, _ := record.Get("productID")
		productID, _ := bson.ObjectIDFromHex(productIDStr.(string))
		productIDs = append(productIDs, productID)
	}

	return productIDs, result.Err()
}

func (r *GraphRepository) GetFrequentlyBoughtTogether(
	ctx context.Context,
	productID bson.ObjectID,
	limit int,
) ([]bson.ObjectID, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
        MATCH (p1:Product {id: $productID})<-[r1:INTERACTED {type: 'purchase'}]-(u:User)
              -[r2:INTERACTED {type: 'purchase'}]->(p2:Product)
        WHERE p1 <> p2
        WITH p2, COUNT(DISTINCT u) AS frequency
        RETURN p2.id AS productID, frequency
        ORDER BY frequency DESC
        LIMIT $limit
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"productID": productID.Hex(),
		"limit":     limit,
	})
	if err != nil {
		return nil, err
	}

	var productIDs []bson.ObjectID
	for result.Next(ctx) {
		record := result.Record()
		productIDStr, _ := record.Get("productID")
		productId, _ := bson.ObjectIDFromHex(productIDStr.(string))
		productIDs = append(productIDs, productId)
	}

	return productIDs, result.Err()
}

func (r *GraphRepository) GetSimilarProducts(
	ctx context.Context,
	productID bson.ObjectID,
	limit int,
) ([]bson.ObjectID, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
        MATCH (p1:Product {id: $productID})<-[r1:INTERACTED]-(u:User)-[r2:INTERACTED]->(p2:Product)
        WHERE p1 <> p2
        WITH p2, SUM(r1.weight * r2.weight) AS similarity
        RETURN p2.id AS productID, similarity
        ORDER BY similarity DESC
        LIMIT $limit
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"productID": productID.Hex(),
		"limit":     limit,
	})
	if err != nil {
		return nil, err
	}

	var productIDs []bson.ObjectID
	for result.Next(ctx) {
		record := result.Record()
		productIDStr, _ := record.Get("productID")
		productId, _ := bson.ObjectIDFromHex(productIDStr.(string))
		productIDs = append(productIDs, productId)
	}

	return productIDs, result.Err()
}

func (r *GraphRepository) CalculateUserSimilarity(
	ctx context.Context,
	userID1, userID2 bson.ObjectID,
) (float64, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
        MATCH (u1:User {id: $userID1})-[:INTERACTED]->(p:Product)<-[:INTERACTED]-(u2:User {id: $userID2})
        WITH COUNT(DISTINCT p) AS intersection
        
        MATCH (u1:User {id: $userID1})-[:INTERACTED]->(p1:Product)
        WITH intersection, COUNT(DISTINCT p1) AS count1
        
        MATCH (u2:User {id: $userID2})-[:INTERACTED]->(p2:Product)
        WITH intersection, count1, COUNT(DISTINCT p2) AS count2
        
        RETURN toFloat(intersection) / (count1 + count2 - intersection) AS similarity
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"userID1": userID1.Hex(),
		"userID2": userID2.Hex(),
	})
	if err != nil {
		return 0, err
	}

	if result.Next(ctx) {
		record := result.Record()
		similarity, _ := record.Get("similarity")
		if similarity != nil {
			return similarity.(float64), nil
		}
	}

	return 0, result.Err()
}

func (r *GraphRepository) GetProductPopularityScore(
	ctx context.Context,
	productID bson.ObjectID,
) (float64, error) {
	var err error
	session := r.driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer func(session neo4j.SessionWithContext, ctx context.Context) {
		closeErr := session.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(session, ctx)

	query := `
        MATCH (p:Product {id: $productID})<-[r:INTERACTED]-(u:User)
        RETURN SUM(r.weight) AS popularity
    `

	result, err := session.Run(ctx, query, map[string]interface{}{
		"productID": productID.Hex(),
	})
	if err != nil {
		return 0, err
	}

	if result.Next(ctx) {
		record := result.Record()
		popularity, _ := record.Get("popularity")
		if popularity != nil {
			return popularity.(float64), nil
		}
	}

	return 0, result.Err()
}
