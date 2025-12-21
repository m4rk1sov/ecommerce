package main

import (
	"log"

	"github.com/m4rk1sov/ecommerce/config"
	"github.com/m4rk1sov/ecommerce/internal/app"
)

func main() {
	// config and launch
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Config error: %s", err)
	}

	app.Run(cfg)
}
