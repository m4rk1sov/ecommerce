package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database) *UserRepository {
	return &UserRepository{
		collection: db.Collection("users"),
	}
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	result, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return err
	}

	user.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *UserRepository) GetByID(ctx context.Context, id bson.ObjectID) (*entity.User, error) {
	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	user.UpdatedAt = time.Now()

	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"_id": user.ID},
		bson.M{"set": user},
	)
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]*entity.User, error) {
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

	var users []*entity.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}
