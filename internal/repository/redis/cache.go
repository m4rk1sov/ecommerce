package redis

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type CacheRepository struct {
	client *redis.Client
}

func NewCacheRepository(client *redis.Client) *CacheRepository {
	return &CacheRepository{
		client: client,
	}
}

func (r *CacheRepository) Get(ctx context.Context, key string) (string, error) {
	val, err := r.client.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", fmt.Errorf("key not found")
	}
	return val, err
}

func (r *CacheRepository) Set(ctx context.Context, key string, value string, ttl int) error {
	return r.client.Set(ctx, key, value, time.Duration(ttl)*time.Second).Err()
}

func (r *CacheRepository) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

func (r *CacheRepository) IncrementCounter(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// AddToSortedSet adds member to sorted set with score
func (r *CacheRepository) AddToSortedSet(ctx context.Context, key string, score float64, member string) error {
	return r.client.ZAdd(ctx, key, redis.Z{
		Score:  score,
		Member: member,
	}).Err()
}

// GetTopN returns top N members from the sorted set (highest scores)
func (r *CacheRepository) GetTopN(ctx context.Context, key string, n int) ([]string, error) {
	return r.client.ZRevRange(ctx, key, 0, int64(n-1)).Result()
}

// Cache keys helper
func RecommendationCacheKey(userID string) string {
	return fmt.Sprintf("rec:user:%s", userID)
}

func ProductCacheKey(productID string) string {
	return fmt.Sprintf("product:%s", productID)
}

func PopularProductsKey() string {
	return "popular:products"
}

func UserSessionKey(sessionID string) string {
	return fmt.Sprintf("sessing:%s", sessionID)
}

func ProductViewCountKey(productID string) string {
	return fmt.Sprintf("views:product:%s", productID)
}
