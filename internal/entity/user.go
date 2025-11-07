package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username     string             `bson:"username" json:"username"`
	Email        string             `bson:"email" json:"email"`
	PasswordHash string             `bson:"password_hash" json:"-"`
	FirstName    string             `bson:"first_name" json:"firstName"`
	LastName     string             `bson:"last_name" json:"lastName"`
	Preferences  UserPreferences    `bson:"preferences" json:"preferences"`
	CreatedAt    time.Time          `bson:"created_at" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updatedAt"`
}

type UserPreferences struct {
	Categories []string   `bson:"categories" json:"categories"`
	PriceRange PriceRange `bson:"price_range" json:"priceRange"`
}

type PriceRange struct {
	Min float64 `bson:"min" json:"min"`
	Max float64 `bson:"max" json:"max"`
}
