package config

import (
	"fmt"
	
	"github.com/caarlos0/env/v11"
)

type (
	Config struct {
		App     App
		HTTP    HTTP
		Log     Log
		PG      PG
		Swagger Swagger
	}
	
	App struct {
		Name    string `env:"APP_NAME,required"`
		Version string `env:"APP_VERSION,required"`
	}
	
	HTTP struct {
		Port string `env:"HTTP_PORT,required"`
	}
	
	Log struct {
		Level string `env:"LOG_LEVEL,required"`
	}
	
	PG struct {
	}
	
	Swagger struct {
		Enabled bool `env:"SWAGGER_ENABLED" envDefault:"false"`
	}
)

func NewConfig() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("config error: %w", err)
	}
	
	return cfg, nil
}
