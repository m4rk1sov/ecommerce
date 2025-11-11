package v1

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func GetRecommendations(uc *usecase.RecommendationUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

		recommendations, err := uc.GetPersonalizedRecommendations(c.Request.Context(), userID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, recommendations)
	}
}

func GetCollaborativeRecommendations(uc *usecase.RecommendationUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

		recommendations, err := uc.GetCollaborativeRecommendations(c.Request.Context(), userID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, recommendations)
	}
}

func GetContentBasedRecommendations(uc *usecase.RecommendationUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

		recommendations, err := uc.GetContentBasedRecommendations(c.Request.Context(), userID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, recommendations)
	}
}

func GetRelatedProducts(uc *usecase.RecommendationUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID, err := bson.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

		products, err := uc.GetProductRecommendations(c.Request.Context(), productID, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"products": products})
	}
}
