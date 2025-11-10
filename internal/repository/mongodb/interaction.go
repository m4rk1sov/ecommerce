package mongodb

import (
	"context"
	"errors"
	"time"
	
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type InteractionRepository struct {
	interactions *mongo.Collection
	purchases    *mongo.Collection
}

func NewInteractionRepository(db *mongo.Database) *InteractionRepository {
	return &InteractionRepository{
		interactions: db.Collection("interactions"),
		purchases:    db.Collection("purchases"),
	}
}

func (r *InteractionRepository) Create(ctx context.Context, interaction *entity.Interaction) error {
	interaction.Timestamp = time.Now()
	
	result, err := r.interactions.InsertOne(ctx, interaction)
	if err != nil {
		return err
	}
	
	interaction.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *InteractionRepository) GetUserInteractions(ctx context.Context, userID bson.ObjectID, limit int) ([]*entity.Interaction, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit))
	
	cursor, err := r.interactions.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var interactions []*entity.Interaction
	if err := cursor.All(ctx, &interactions); err != nil {
		return nil, err
	}
	return interactions, nil
}

func (r *InteractionRepository) GetProductInteractions(ctx context.Context, productID bson.ObjectID, limit int) ([]*entity.Interaction, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "timestamp", Value: -1}}).
		SetLimit(int64(limit))
	
	cursor, err := r.interactions.Find(ctx, bson.M{"product_id": productID}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var interactions []*entity.Interaction
	if err := cursor.All(ctx, &interactions); err != nil {
		return nil, err
	}
	return interactions, nil
}

func (r *InteractionRepository) GetUserPurchaseHistory(ctx context.Context, userID bson.ObjectID) ([]*entity.Purchase, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.purchases.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var purchases []*entity.Purchase
	if err := cursor.All(ctx, &purchases); err != nil {
		return nil, err
	}
	return purchases, nil
}

func (r *InteractionRepository) CreatePurchase(ctx context.Context, purchase *entity.Purchase) error {
	purchase.CreatedAt = time.Now()
	
	result, err := r.purchases.InsertOne(ctx, purchase)
	if err != nil {
		return err
	}
	
	purchase.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *InteractionRepository) GetInteractionCounts(ctx context.Context, productID bson.ObjectID) (map[entity.InteractionType]int, error) {
	pipeline := []bson.M{
		{"$match": bson.M{"product_id": productID}},
		{"$group": bson.M{
			"_id":   "$type",
			"count": bson.M{"$sum": 1},
		}},
	}
	
	cursor, err := r.interactions.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	counts := make(map[entity.InteractionType]int)
	for cursor.Next(ctx) {
		var result struct {
			ID    entity.InteractionType `bson:"_id"`
			Count int                    `bson:"count"`
		}
		if err := cursor.Decode(&result); err != nil {
			return nil, err
		}
		counts[result.ID] = result.Count
	}
	
	return counts, nil
}
