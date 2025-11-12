package mongodb

//import (
//	"fmt"
//
//	"go.mongodb.org/mongo-driver/v2/mongo"
//	"go.mongodb.org/mongo-driver/v2/mongo/options"
//)
//
//func NewClient(uri string) (*mongo.Client, error) {
//	//ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
//	//defer cancel()
//
//	clientOptions := options.Client().
//		ApplyURI(uri).
//		SetMaxPoolSize(100).
//		SetMinPoolSize(10)
//
//	client, err := mongo.Connect(clientOptions)
//	if err != nil {
//		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
//	}
//
//	// Ping to verify connection
//	if err = client.Ping(ctx, nil); err != nil {
//		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
//	}
//
//	return client, nil
//}
