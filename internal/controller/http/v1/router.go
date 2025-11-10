// internal/controller/http/v1/router.go
package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
)

func NewRouter(handler *gin.Engine, uc *UseCases) {
	h := handler.Group("/api/v1")
	{
		// Authentication
		auth := h.Group("/auth")
		{
			auth.POST("/register", RegisterUser(uc.User))
			auth.POST("/login", LoginUser(uc.User))
		}

		// Users (protected)
		users := h.Group("/users")
		users.Use(AuthMiddleware())
		{
			users.GET("/profile", GetUserProfile(uc.User))
			users.PUT("/profile", UpdateUserProfile(uc.User))
			users.GET("/history", GetUserHistory(uc.Interaction))
		}

		// Products
		products := h.Group("/products")
		{
			products.GET("", ListProducts(uc.Product))
			products.GET("/:id", GetProduct(uc.Product))
			products.GET("/search", SearchProducts(uc.Product))
			products.GET("/:id/related", GetRelatedProducts(uc.Recommendation))
		}

		// Products management (protected)
		productsAdmin := h.Group("/admin/products")
		productsAdmin.Use(AuthMiddleware())
		{
			productsAdmin.POST("", CreateProduct(uc.Product))
			productsAdmin.PUT("/:id", UpdateProduct(uc.Product))
			productsAdmin.DELETE("/:id", DeleteProduct(uc.Product))
		}

		// Interactions (protected)
		interactions := h.Group("/interactions")
		interactions.Use(AuthMiddleware())
		{
			interactions.POST("/view", RecordView(uc.Interaction))
			interactions.POST("/like", RecordLike(uc.Interaction))
			interactions.POST("/purchase", RecordPurchase(uc.Interaction))
		}

		// Recommendations (protected)
		recommendations := h.Group("/recommendations")
		recommendations.Use(AuthMiddleware())
		{
			recommendations.GET("", GetRecommendations(uc.Recommendation))
			recommendations.GET("/collaborative", GetCollaborativeRecommendations(uc.Recommendation))
			recommendations.GET("/content-based", GetContentBasedRecommendations(uc.Recommendation))
		}
	}
}

type UseCases struct {
	User           *usecase.UserUseCase
	Product        *usecase.ProductUseCase
	Interaction    *usecase.InteractionUseCase
	Recommendation *usecase.RecommendationUseCase
}
