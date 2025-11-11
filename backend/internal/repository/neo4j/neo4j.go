package neo4j

import (
	"context"
	"time"
	
	"github.com/m4rk1sov/ecommerce/config"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"go.uber.org/zap"
)

func InitNeo4j(l *zap.SugaredLogger, cfg *config.Config) neo4j.DriverWithContext {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	driver, err := neo4j.NewDriverWithContext(
		cfg.Neo4j.URI,
		neo4j.BasicAuth(cfg.Neo4j.User, cfg.Neo4j.Password, ""),
	)
	if err != nil {
		l.Fatal("Failed to create Neo4j driver:", err)
	}
	
	if err = driver.VerifyConnectivity(ctx); err != nil {
		l.Fatal("Failed to connect to Neo4j:", err)
	}
	
	l.Infoln("Connected to Neo4j")
	
	return driver
}

func Close(neo4jDriver neo4j.DriverWithContext, ctx context.Context) error {
	err := neo4jDriver.Close(ctx)
	if err != nil {
		return err
	}
	return nil
}
