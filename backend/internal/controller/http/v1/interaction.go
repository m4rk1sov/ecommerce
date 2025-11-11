package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type interactionRoutes struct {
	interactionUC *usecase.InteractionUseCase
}

type interactionReq struct {
	ProductID string `json:"productID" binding:"required"`
}

type purchaseReq struct {
	ProductID string  `json:"productID" binding:"required"`
	Quantity  int     `json:"quantity" binding:"required,min=1"`
	Price     float64 `json:"price" binding:"required"`
}

func RecordView(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		var req interactionReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		pid, err := bson.ObjectIDFromHex(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productId"})
			return
		}
		if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionView); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
	}
}

func RecordLike(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		var req interactionReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		pid, err := bson.ObjectIDFromHex(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productId"})
			return
		}
		if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionLike); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
	}
}

func RecordPurchase(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		var req purchaseReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		pid, err := bson.ObjectIDFromHex(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productId"})
			return
		}
		// Persist interaction as purchase and optionally call a repo method to save purchases if desired
		if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionPurchase); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
	}
}

func GetUserHistory(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		_ = getUserIDFromContext(c)
		// For a minimal MVP, fetch last N interactions via repo directly if you expose a method; placeholder:
		c.JSON(http.StatusNotImplemented, gin.H{"message": "history endpoint not implemented yet"})
	}
}
