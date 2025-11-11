package usecase

import (
	"context"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id bson.ObjectID) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id bson.ObjectID) error
	List(ctx context.Context, limit, offset int) ([]*entity.User, error)
}

type ProductRepository interface {
	Create(ctx context.Context, product *entity.Product) error
	GetByID(ctx context.Context, id bson.ObjectID) (*entity.Product, error)
	Update(ctx context.Context, product *entity.Product) error
	Delete(ctx context.Context, id bson.ObjectID) error
	List(ctx context.Context, limit, offset int) ([]*entity.Product, error)
	Search(ctx context.Context, query string, category string, limit int) ([]*entity.Product, error)
	GetByCategory(ctx context.Context, category string, limit int) ([]*entity.Product, error)
	GetPopular(ctx context.Context, limit int) ([]*entity.Product, error)
}

type InteractionRepository interface {
	Create(ctx context.Context, interaction *entity.Interaction) error
	GetUserInteractions(ctx context.Context, userID bson.ObjectID, limit int) ([]*entity.Interaction, error)
	GetProductInteractions(ctx context.Context, productID bson.ObjectID, limit int) ([]*entity.Interaction, error)
	GetUserPurchaseHistory(ctx context.Context, userID bson.ObjectID) ([]*entity.Purchase, error)
	CreatePurchase(ctx context.Context, purchase *entity.Purchase) error
	GetInteractionCounts(ctx context.Context, productID bson.ObjectID) (map[entity.InteractionType]int, error)
}

type CacheRepository interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value string, ttl int) error
	Delete(ctx context.Context, key string) error
	IncrementCounter(ctx context.Context, key string) (int64, error)
	GetTopN(ctx context.Context, key string, n int) ([]string, error)
	AddToSortedSet(ctx context.Context, key string, score float64, member string) error
}

type GraphRepository interface {
	//	User - Product
	CreateUserProductRelation(ctx context.Context, userID, productID bson.ObjectID, relationType string, weight float64) error
	GetUserProductRelations(ctx context.Context, userID bson.ObjectID) ([]entity.Interaction, error)

	// Collaborative filtering
	FindSimilarUsers(ctx context.Context, userID bson.ObjectID, limit int) ([]entity.UserSimilarity, error)
	GetCollaborativeRecommendations(ctx context.Context, userID bson.ObjectID, limit int) ([]bson.ObjectID, error)

	// Product relationships
	GetFrequentlyBoughtTogether(ctx context.Context, productID bson.ObjectID, limit int) ([]bson.ObjectID, error)
	GetSimilarProducts(ctx context.Context, productID bson.ObjectID, limit int) ([]bson.ObjectID, error)

	// Graph analytics
	CalculateUserSimilarity(ctx context.Context, userID1, userID2 bson.ObjectID) (float64, error)
	GetProductPopularityScore(ctx context.Context, productID bson.ObjectID) (float64, error)
}

type RecommendationEngine interface {
	GetPersonalizedRecommendations(ctx context.Context, userID bson.ObjectID, limit int) (*entity.Recommendation, error)
	GetCollaborativeRecommendations(ctx context.Context, userID bson.ObjectID, limit int) (*entity.Recommendation, error)
	GetContentBasedRecommendations(ctx context.Context, userID bson.ObjectID, limit int) (*entity.Recommendation, error)
	GetHybridRecommendations(ctx context.Context, userID bson.ObjectID, limit int) (*entity.Recommendation, error)
	GetProductRecommendations(ctx context.Context, productID bson.ObjectID, limit int) ([]*entity.Product, error)
}
