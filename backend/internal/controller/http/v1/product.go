package v1

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func ListProducts(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

		products, err := uc.List(c.Request.Context(), limit, offset)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"products": products})
	}
}

func GetProduct(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := bson.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid productID"})
			return
		}

		product, err := uc.GetByID(c.Request.Context(), id)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

func SearchProducts(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := c.Query("q")
		category := c.Query("category")
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

		products, err := uc.Search(c.Request.Context(), query, category, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"products": products})
	}
}

func CreateProduct(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product entity.Product
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := uc.Create(c.Request.Context(), &product); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, product)
	}
}

func UpdateProduct(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := bson.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid productID"})
			return
		}

		var product entity.Product
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		product.ID = id
		if err := uc.Update(c.Request.Context(), &product); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, product)
	}
}

func DeleteProduct(uc *usecase.ProductUseCase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := bson.ObjectIDFromHex(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid productID"})
			return
		}

		if err := uc.Delete(c.Request.Context(), id); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
	}
}
