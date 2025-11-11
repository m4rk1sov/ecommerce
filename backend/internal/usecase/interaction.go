package usecase

import (
	"context"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type InteractionUseCase struct {
	repo      InteractionRepository
	graphRepo GraphRepository
}

func NewInteractionUseCase(repo InteractionRepository, graphRepo GraphRepository) *InteractionUseCase {
	return &InteractionUseCase{
		repo:      repo,
		graphRepo: graphRepo,
	}
}

func (uc *InteractionUseCase) RecordInteraction(ctx context.Context, userID, productID bson.ObjectID, interactionType entity.InteractionType) error {
	weight := getInteractionWeight(interactionType)

	interaction := &entity.Interaction{
		UserID:    userID,
		ProductID: productID,
		Type:      interactionType,
		Weight:    weight,
	}

	// Save to MongoDB
	if err := uc.repo.Create(ctx, interaction); err != nil {
		return err
	}

	// Update graph in Neo4j
	return uc.graphRepo.CreateUserProductRelation(ctx, userID, productID, string(interactionType), weight)
}

func getInteractionWeight(t entity.InteractionType) float64 {
	switch t {
	case entity.InteractionView:
		return 1.0
	case entity.InteractionLike:
		return 3.0
	case entity.InteractionCart:
		return 5.0
	case entity.InteractionPurchase:
		return 10.0
	default:
		return 1.0
	}
}
