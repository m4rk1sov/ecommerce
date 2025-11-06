package entity

import "go.mongodb.org/mongo-driver/bson/primitive"

type Recommendation struct {
	UserID    primitive.ObjectID   `json:"userID"`
	Products  []RecommendedProduct `json:"products"`
	Algorithm string               `json:"algorithm"` // collaborative, content-based, hybrid
}

type RecommendedProduct struct {
	Product Product `json:"product"`
	Score   float64 `json:"score"`
	Reason  string  `json:"reason"`
}

type UserSimilarity struct {
	UserID1    primitive.ObjectID `json:"userID1"`
	UserID2    primitive.ObjectID `json:"userID2"`
	Similarity float64            `json:"similarity"`
}
