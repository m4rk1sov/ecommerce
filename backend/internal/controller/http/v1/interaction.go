package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type interactionReq struct {
	ProductID string `json:"productID" binding:"required"`
}

type purchaseReq struct {
	Products []struct {
		ProductID string  `json:"productId" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required,min=1"`
		Price     float64 `json:"price" binding:"required,min=0"`
	} `json:"products" binding:"required,min=1"`
	Total  float64 `json:"total" binding:"required,min=0"`
	Status string  `json:"status"`
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productID"})
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid productID"})
			return
		}
		if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionLike); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusNoContent)
	}
}

func RecordCart(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)
		var req interactionReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		pid, err := bson.ObjectIDFromHex(req.ProductID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid productID"})
			return
		}

		if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionCart); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Added to cart"})
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
		// Convert request to entity
		purchase := &entity.Purchase{
			UserID:   userID,
			Total:    req.Total,
			Status:   req.Status,
			Products: make([]entity.PurchaseItem, len(req.Products)),
		}

		for i, p := range req.Products {
			pid, err := bson.ObjectIDFromHex(p.ProductID)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid productID"})
				return
			}

			purchase.Products[i] = entity.PurchaseItem{
				ProductID: pid,
				Quantity:  p.Quantity,
				Price:     p.Price,
			}

			// Record purchase interaction for each product
			if err := uc.RecordInteraction(c.Request.Context(), userID, pid, entity.InteractionPurchase); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		if err := uc.CreatePurchase(c.Request.Context(), purchase); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Purchase recorded", "purchase": purchase})
	}
}

func GetUserHistory(uc *usecase.InteractionUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := getUserIDFromContext(c)

		purchases, err := uc.GetUserPurchaseHistory(c.Request.Context(), userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"purchases": purchases})
	}
}
