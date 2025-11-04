//go:build migrate

package app

import (
	"log"
	"os"
	
	"github.com/golang-migrate/migrate/v4"
	// migrate tools
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const (
	_defaultAttempts = 20
	_defaultTimeout  = time.Second
)

func init() {
	dbURL, ok := os.LookupEnv("PG_URL")
	if !ok || len(dbURL) == 0 {
		log.Fatalf("migrate: environment variable not declared: PG_URL")
	}
	
	dbURL += "?sslmode=false"
	
	var (
		attempts = _defaultAttempts
		err      error
		m        *migrate.Migrate
	)
	
	for attempts > 0 {
		m, err = migrate.New("file://migrations", dbURL)
		if err == nil {
			break
		}
		
		log.Printf("Migrate: postgres is trying to connect, attempts left: %d", attempts)
	}
}
