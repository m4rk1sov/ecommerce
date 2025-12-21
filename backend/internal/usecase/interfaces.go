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

type CacheRepository interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value string, ttl int) error
	Delete(ctx context.Context, key string) error
	IncrementCounter(ctx context.Context, key string) (int64, error)
	GetTopN(ctx context.Context, key string, n int) ([]string, error)
	AddToSortedSet(ctx context.Context, key string, score float64, member string) error
}
