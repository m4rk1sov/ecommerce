package usecase

import (
	"context"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ProductUseCase struct {
	repo      ProductRepository
	cacheRepo CacheRepository
}

func NewProductUseCase(repo ProductRepository, cacheRepo CacheRepository) *ProductUseCase {
	return &ProductUseCase{
		repo:      repo,
		cacheRepo: cacheRepo,
	}
}

func (uc *ProductUseCase) Create(ctx context.Context, product *entity.Product) error {
	return uc.repo.Create(ctx, product)
}

func (uc *ProductUseCase) GetByID(ctx context.Context, id bson.ObjectID) (*entity.Product, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *ProductUseCase) Update(ctx context.Context, product *entity.Product) error {
	return uc.repo.Update(ctx, product)
}

func (uc *ProductUseCase) Delete(ctx context.Context, id bson.ObjectID) error {
	return uc.repo.Delete(ctx, id)
}

func (uc *ProductUseCase) List(ctx context.Context, limit, offset int) ([]*entity.Product, error) {
	return uc.repo.List(ctx, limit, offset)
}

func (uc *ProductUseCase) Search(ctx context.Context, query, category string, limit int) ([]*entity.Product, error) {
	return uc.repo.Search(ctx, query, category, limit)
}
