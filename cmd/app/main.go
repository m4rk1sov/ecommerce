package main

import "log"

func main() {
	// config and launch
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Config error: %s", err)
	}
	
	app.Run(cfg)
}
