package config

import (
	"fmt"
	"time"
	
	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type (
	Config struct {
		App         App
		HTTP        HTTP
		Log         Log
		MongoDB     MongoDB
		Redis       Redis
		Neo4j       Neo4j
		JWT         JWT
		Swagger     Swagger
		Interaction Interaction
	}
	
	App struct {
		Name    string `env:"APP_NAME,required"`
		Version string `env:"APP_VERSION,required"`
		Env     string `env:"APP_ENV"`
	}
	
	HTTP struct {
		Port string `env:"HTTP_PORT,required"`
	}
	
	Log struct {
		Level string `env:"LOG_LEVEL,required"`
	}
	
	MongoDB struct {
		URI      string `env:"MONGODB_URI,required"`
		Database string `env:"MONGODB_DATABASE" envDefault:"ecommerce"`
		User     string `env:"MONGODB_USER,required"`
		Password string `env:"MONGODB_PASSWORD,required"`
	}
	
	Redis struct {
		Addr     string `env:"REDIS_ADDR,required"`
		Password string `env:"REDIS_PASSWORD"`
		DB       int    `env:"REDIS_DB,required"`
		CacheTTL int    `env:"REDIS_CACHE_TTL,required"`
	}
	
	Neo4j struct {
		URI      string `env:"NEO4J_URI,required"`
		User     string `env:"NEO4J_USER,required"`
		Password string `env:"NEO4J_PASSWORD,required"`
	}
	
	JWT struct {
		Secret     string        `env:"JWT_SECRET,required"`
		Expiration time.Duration `env:"JWT_EXPIRATION,required"`
	}
	Swagger struct {
		Enabled bool `env:"SWAGGER_ENABLED" envDefault:"false"`
	}
	
	Interaction struct {
		CacheTTL        int `env:"RECOMMENDATION_CACHE_TTL,required"`
		MinInteractions int `env:"MIN_INTERACTIONS_FOR_RECOMMENDATION,required"`
	}
)

func NewConfig() (*Config, error) {
	err := godotenv.Load(".env")
	if err != nil {
		return nil, fmt.Errorf("failed to load .env file: %w", err)
	}
	cfg := &Config{}
	if err = env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("config error: %w", err)
	}
	
	return cfg, nil
}
