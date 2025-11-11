package redis

import (
	"context"
	"time"

	"github.com/m4rk1sov/ecommerce/config"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

func InitRedis(l *zap.SugaredLogger, cfg *config.Config) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		l.Fatal("Failed to connect to Redis:", err)
	}

	l.Infoln("Connected to Redis")
	return client
}

func Close(redisClient *redis.Client) error {
	err := redisClient.Close()
	if err != nil {
		return err
	}
	return nil
}
