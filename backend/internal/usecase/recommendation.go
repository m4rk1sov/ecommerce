package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sort"

	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type RecommendationUseCase struct {
	userRepo        UserRepository
	productRepo     ProductRepository
	interactionRepo InteractionRepository
	cacheRepo       CacheRepository
	graphRepo       GraphRepository
	cacheTTL        int
	minInteractions int
}

func NewRecommendationUseCase(
	userRepo UserRepository,
	productRepo ProductRepository,
	interactionRepo InteractionRepository,
	cacheRepo CacheRepository,
	graphRepo GraphRepository,
	cacheTTL, minInteractions int,
) *RecommendationUseCase {
	return &RecommendationUseCase{
		userRepo:        userRepo,
		productRepo:     productRepo,
		interactionRepo: interactionRepo,
		cacheRepo:       cacheRepo,
		graphRepo:       graphRepo,
		cacheTTL:        cacheTTL,
		minInteractions: minInteractions,
	}
}

// GetPersonalizedRecommendations - Main recommendation method
func (uc *RecommendationUseCase) GetPersonalizedRecommendations(
	ctx context.Context,
	userID bson.ObjectID,
	limit int,
) (*entity.Recommendation, error) {
	// Step 1: Check cache first (Redis)
	cacheKey := fmt.Sprintf("rec:user:%s", userID.Hex())
	if cached, err := uc.cacheRepo.Get(ctx, cacheKey); err == nil {
		var rec entity.Recommendation
		if json.Unmarshal([]byte(cached), &rec) == nil {
			return &rec, nil
		}
	}

	// Step 2: Check if user has enough interactions
	interactions, err := uc.interactionRepo.GetUserInteractions(ctx, userID, 100)
	if err != nil {
		return nil, err
	}

	var recommendation *entity.Recommendation

	if len(interactions) < uc.minInteractions {
		// Cold start: return popular products
		recommendation, err = uc.getPopularRecommendations(ctx, limit)
	} else {
		// Hybrid approach: combine collaborative and content-based
		recommendation, err = uc.GetHybridRecommendations(ctx, userID, limit)
	}

	if err != nil {
		return nil, err
	}

	// Step 3: Cache result (Redis)
	if data, err := json.Marshal(recommendation); err == nil {
		err = uc.cacheRepo.Set(ctx, cacheKey, string(data), uc.cacheTTL)
	}

	return recommendation, nil
}

// GetCollaborativeRecommendations - User-based collaborative filtering using Neo4j
func (uc *RecommendationUseCase) GetCollaborativeRecommendations(
	ctx context.Context,
	userID bson.ObjectID,
	limit int,
) (*entity.Recommendation, error) {
	// Use Neo4j to find similar users and their preferences
	productIDs, err := uc.graphRepo.GetCollaborativeRecommendations(ctx, userID, limit)
	if err != nil {
		return nil, err
	}

	// Fetch product details from MongoDB
	var recommendedProducts []entity.RecommendedProduct
	for i, productID := range productIDs {
		product, err := uc.productRepo.GetByID(ctx, productID)
		if err != nil {
			continue
		}

		score := 1.0 - (float64(i) / float64(len(productIDs)))
		recommendedProducts = append(recommendedProducts, entity.RecommendedProduct{
			Product: *product,
			Score:   score,
			Reason:  "Users with similar taste liked this",
		})
	}

	return &entity.Recommendation{
		UserID:    userID,
		Products:  recommendedProducts,
		Algorithm: "collaborative",
		Score:     uc.calculateRecommendationScore(recommendedProducts),
	}, nil
}

// GetContentBasedRecommendations - Based on user's interaction history
func (uc *RecommendationUseCase) GetContentBasedRecommendations(
	ctx context.Context,
	userID bson.ObjectID,
	limit int,
) (*entity.Recommendation, error) {
	// Get user's interaction history from MongoDB
	interactions, err := uc.interactionRepo.GetUserInteractions(ctx, userID, 50)
	if err != nil {
		return nil, err
	}

	// Build user profile (categories and preferences)
	categoryScores := make(map[string]float64)
	interactedProducts := make(map[string]bool)

	for _, interaction := range interactions {
		product, err := uc.productRepo.GetByID(ctx, interaction.ProductID)
		if err != nil {
			continue
		}

		categoryScores[product.Category] += interaction.Weight
		interactedProducts[interaction.ProductID.Hex()] = true
	}

	// Find top categories
	var topCategories []string
	for category := range categoryScores {
		topCategories = append(topCategories, category)
	}
	sort.Slice(topCategories, func(i, j int) bool {
		return categoryScores[topCategories[i]] > categoryScores[topCategories[j]]
	})

	if len(topCategories) > 3 {
		topCategories = topCategories[:3]
	}

	// Get products from top categories
	var allProducts []*entity.Product
	for _, category := range topCategories {
		products, err := uc.productRepo.GetByCategory(ctx, category, 20)
		if err != nil {
			continue
		}
		allProducts = append(allProducts, products...)
	}

	// Filter out already interacted products and score remaining
	var recommendedProducts []entity.RecommendedProduct
	for _, product := range allProducts {
		if interactedProducts[product.ID.Hex()] {
			continue
		}

		score := categoryScores[product.Category] / 100.0
		if score > 1.0 {
			score = 1.0
		}

		recommendedProducts = append(recommendedProducts, entity.RecommendedProduct{
			Product: *product,
			Score:   score,
			Reason:  fmt.Sprintf("Based on your interest in %s", product.Category),
		})

		if len(recommendedProducts) >= limit {
			break
		}
	}

	return &entity.Recommendation{
		UserID:    userID,
		Products:  recommendedProducts,
		Algorithm: "content-based",
		Score:     uc.calculateRecommendationScore(recommendedProducts),
	}, nil
}

// GetHybridRecommendations - Combines collaborative and content-based
func (uc *RecommendationUseCase) GetHybridRecommendations(
	ctx context.Context,
	userID bson.ObjectID,
	limit int,
) (*entity.Recommendation, error) {
	// Get both types of recommendations
	collab, err := uc.GetCollaborativeRecommendations(ctx, userID, limit)
	if err != nil {
		collab = &entity.Recommendation{Products: []entity.RecommendedProduct{}}
	}

	content, err := uc.GetContentBasedRecommendations(ctx, userID, limit)
	if err != nil {
		content = &entity.Recommendation{Products: []entity.RecommendedProduct{}}
	}

	// Merge and re-rank (weighted combination: 60% collaborative, 40% content)
	productScores := make(map[string]*entity.RecommendedProduct)

	for _, rec := range collab.Products {
		productID := rec.Product.ID.Hex()
		rec.Score *= 0.6
		productScores[productID] = &rec
	}

	for _, rec := range content.Products {
		productID := rec.Product.ID.Hex()
		if existing, exists := productScores[productID]; exists {
			existing.Score += rec.Score * 0.4
			existing.Reason = "Recommended based on similar users and your interests"
		} else {
			rec.Score *= 0.4
			productScores[productID] = &rec
		}
	}

	// Convert to slice and sort by score
	var recommendations []entity.RecommendedProduct
	for _, rec := range productScores {
		recommendations = append(recommendations, *rec)
	}

	sort.Slice(recommendations, func(i, j int) bool {
		return recommendations[i].Score > recommendations[j].Score
	})

	if len(recommendations) > limit {
		recommendations = recommendations[:limit]
	}

	return &entity.Recommendation{
		UserID:    userID,
		Products:  recommendations,
		Algorithm: "hybrid",
		Score:     uc.calculateRecommendationScore(recommendations),
	}, nil
}

// GetProductRecommendations - "Customers who viewed this also viewed..."
func (uc *RecommendationUseCase) GetProductRecommendations(
	ctx context.Context,
	productID bson.ObjectID,
	limit int,
) ([]*entity.Product, error) {
	// Check cache first
	cacheKey := fmt.Sprintf("rec:product:%s", productID.Hex())
	if cached, err := uc.cacheRepo.Get(ctx, cacheKey); err == nil {
		var products []*entity.Product
		if json.Unmarshal([]byte(cached), &products) == nil {
			return products, nil
		}
	}

	// Get similar products from Neo4j
	productIDs, err := uc.graphRepo.GetSimilarProducts(ctx, productID, limit)
	if err != nil {
		return nil, err
	}

	// Fetch product details from MongoDB
	var products []*entity.Product
	for _, id := range productIDs {
		product, err := uc.productRepo.GetByID(ctx, id)
		if err != nil {
			continue
		}
		products = append(products, product)
	}

	// Cache result
	if data, err := json.Marshal(products); err == nil {
		err = uc.cacheRepo.Set(ctx, cacheKey, string(data), uc.cacheTTL)
	}

	return products, nil
}

// getPopularRecommendations - For cold start problem
func (uc *RecommendationUseCase) getPopularRecommendations(
	ctx context.Context,
	limit int,
) (*entity.Recommendation, error) {
	// Get popular products from MongoDB (by rating)
	products, err := uc.productRepo.GetPopular(ctx, limit)
	if err != nil {
		return nil, err
	}

	var recommendedProducts []entity.RecommendedProduct
	for _, product := range products {
		recommendedProducts = append(recommendedProducts, entity.RecommendedProduct{
			Product: *product,
			Score:   product.Rating / 5.0,
			Reason:  "Popular product",
		})
	}

	return &entity.Recommendation{
		Products:  recommendedProducts,
		Algorithm: "popularity",
		Score:     uc.calculateRecommendationScore(recommendedProducts),
	}, nil
}

// calculateRecommendationScore - Overall quality metric
func (uc *RecommendationUseCase) calculateRecommendationScore(products []entity.RecommendedProduct) float64 {
	if len(products) == 0 {
		return 0
	}

	var totalScore float64
	for _, p := range products {
		totalScore += p.Score
	}

	return math.Round((totalScore/float64(len(products)))*100) / 100
}

// InvalidateUserCache - Call this when user makes new interactions
func (uc *RecommendationUseCase) InvalidateUserCache(ctx context.Context, userID bson.ObjectID) error {
	cacheKey := fmt.Sprintf("rec:user:%s", userID.Hex())
	return uc.cacheRepo.Delete(ctx, cacheKey)
}
