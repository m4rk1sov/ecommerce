package v1

import (
	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"go.uber.org/zap"
)

type UseCases struct {
	User           *usecase.UserUseCase
	Product        *usecase.ProductUseCase
	Interaction    *usecase.InteractionUseCase
	Recommendation *usecase.RecommendationUseCase
}

func NewRouterWithMiddleware(l *zap.SugaredLogger, handler *gin.Engine, uc *UseCases, auth gin.HandlerFunc) {
	handler.Use(gin.Recovery())
	handler.Use(corsMiddleware())
	handler.Use(loggingMiddleware(l))

	// Health
	handler.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// api v1 group
	h := handler.Group("/api/v1")
	{
		// Authentication
		authG := h.Group("/auth")
		{
			authG.POST("/register", RegisterUser(uc.User))
			authG.POST("/login", LoginUser(uc.User))
		}

		// Users (protected)
		users := h.Group("/users")
		users.Use(auth)
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
		productsAdmin.Use(auth)
		{
			productsAdmin.POST("", CreateProduct(uc.Product))
			productsAdmin.PUT("/:id", UpdateProduct(uc.Product))
			productsAdmin.DELETE("/:id", DeleteProduct(uc.Product))
		}

		// Interactions (protected)
		interactions := h.Group("/interactions")
		interactions.Use(auth)
		{
			interactions.POST("/view", RecordView(uc.Interaction))
			interactions.POST("/like", RecordLike(uc.Interaction))
			interactions.POST("/cart", RecordCart(uc.Interaction))
			interactions.POST("/purchase", RecordPurchase(uc.Interaction))
		}

		// Recommendations (protected)
		recommendations := h.Group("/recommendations")
		recommendations.Use(auth)
		{
			recommendations.GET("", GetRecommendations(uc.Recommendation))
			recommendations.GET("/collaborative", GetCollaborativeRecommendations(uc.Recommendation))
			recommendations.GET("/content-based", GetContentBasedRecommendations(uc.Recommendation))
		}
	}
}
