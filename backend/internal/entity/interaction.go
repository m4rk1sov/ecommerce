package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type InteractionType string

const (
	InteractionView     InteractionType = "view"
	InteractionLike     InteractionType = "like"
	InteractionPurchase InteractionType = "purchase"
	InteractionCart     InteractionType = "cart"
)

type Interaction struct {
	ID        bson.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID   `bson:"user_id" json:"userID"`
	ProductID bson.ObjectID   `bson:"product_id" json:"productID"`
	Type      InteractionType `bson:"type" json:"type"`
	Weight    float64         `bson:"weight" json:"weight"` // view: 1, like: 3, cart: 5, purchase: 10
	Timestamp time.Time       `bson:"timestamp" json:"timestamp"`
}

type Purchase struct {
	ID        bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	UserID    bson.ObjectID  `bson:"user_id" json:"userID"`
	Products  []PurchaseItem `bson:"products" json:"products"`
	Total     float64        `bson:"total" json:"total"`
	Status    string         `bson:"status" json:"status"`
	CreatedAt time.Time      `bson:"created_at" json:"createdAt"`
}

type PurchaseItem struct {
	ProductID bson.ObjectID `bson:"product_id" json:"productID"`
	Quantity  int           `bson:"quantity" json:"quantity"`
	Price     float64       `bson:"price" json:"price"`
}
