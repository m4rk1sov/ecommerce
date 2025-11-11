package mongodb

import (
	"context"
	"time"

	"github.com/m4rk1sov/ecommerce/config"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.uber.org/zap"
)

func InitMongoDB(l *zap.SugaredLogger, cfg *config.Config) (*mongo.Client, *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoOpts := options.Client().ApplyURI(cfg.MongoDB.URI)
	if cfg.MongoDB.User != "" {
		mongoOpts.SetAuth(options.Credential{Username: cfg.MongoDB.User, Password: cfg.MongoDB.Password})
	}

	client, err := mongo.Connect(mongoOpts)
	if err != nil {
		l.Fatal("Failed to connect to MongoDB:", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		l.Fatal("Failed to ping MongoDB:", err)
	}

	l.Infoln("Connected to MongoDB")

	mdb := client.Database(cfg.MongoDB.Database)

	return client, mdb
}

func Close(mongoClient *mongo.Client, ctx context.Context) error {
	err := mongoClient.Disconnect(ctx)
	if err != nil {
		return err
	}
	return nil
}
