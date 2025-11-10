package mongodb

import (
	"context"
	"time"
	
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
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
