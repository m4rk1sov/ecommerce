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

type ProductRepository struct {
	collection *mongo.Collection
}

func NewProductRepository(db *mongo.Database) *ProductRepository {
	return &ProductRepository{
		collection: db.Collection("products"),
	}
}

func (r *ProductRepository) Create(ctx context.Context, product *entity.Product) error {
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()
	
	result, err := r.collection.InsertOne(ctx, product)
	if err != nil {
		return err
	}
	
	product.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *ProductRepository) GetByID(ctx context.Context, id bson.ObjectID) (*entity.Product, error) {
	var product entity.Product
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *ProductRepository) Update(ctx context.Context, product *entity.Product) error {
	product.UpdatedAt = time.Now()
	
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": product.ID},
		bson.M{"$set": product},
	)
	return err
}

func (r *ProductRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *ProductRepository) List(ctx context.Context, limit, offset int) ([]*entity.Product, error) {
	opts := options.Find().SetLimit(int64(limit)).SetSkip(int64(offset))
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var products []*entity.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) Search(ctx context.Context, query string, category string, limit int) ([]*entity.Product, error) {
	filter := bson.M{}
	
	if query != "" {
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": query, "$options": "i"}},
			{"description": bson.M{"$regex": query, "$options": "i"}},
			{"tags": bson.M{"$regex": query, "$options": "i"}},
		}
	}
	
	if category != "" {
		filter["category"] = category
	}
	
	opts := options.Find().SetLimit(int64(limit))
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var products []*entity.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, err
	}
	return products, err
}

func (r *ProductRepository) GetByCategory(ctx context.Context, category string, limit int) ([]*entity.Product, error) {
	opts := options.Find().SetLimit(int64(limit))
	cursor, err := r.collection.Find(ctx, bson.M{"category": category}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var products []*entity.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, err
	}
	return products, nil
}

func (r *ProductRepository) GetPopular(ctx context.Context, limit int) ([]*entity.Product, error) {
	opts := options.Find().
		SetSort(bson.D{{Key: "rating", Value: -1}, {Key: "review_count", Value: -1}}).
		SetLimit(int64(limit))
	
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		closeErr := cursor.Close(ctx)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(cursor, ctx)
	
	var products []*entity.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, err
	}
	
	return products, nil
}
