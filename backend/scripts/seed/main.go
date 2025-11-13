package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/m4rk1sov/ecommerce/config"
	"github.com/m4rk1sov/ecommerce/internal/entity"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"

	mongoRepo "github.com/m4rk1sov/ecommerce/internal/repository/mongodb"
)

func main() {
	// Load config
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	ctx := context.Background()
	// Connect to MongoDB
	client, err := mongo.Connect(options.Client().ApplyURI(cfg.MongoDB.URI))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer func(client *mongo.Client, ctx context.Context) {
		err := client.Disconnect(ctx)
		if err != nil {
			log.Printf("Failed to close mongodb: %v", err)
		}
	}(client, ctx)

	db := client.Database(cfg.MongoDB.Database)

	// Initialize repositories
	userRepo := mongoRepo.NewUserRepository(db)
	productRepo := mongoRepo.NewProductRepository(db)

	log.Println("Starting database seeding...")

	// Seed users
	users := seedUsers(ctx, userRepo)
	log.Printf("✅ Created %d users\n", len(users))

	// Seed products
	products := seedProducts(ctx, productRepo)
	log.Printf("✅ Created %d products\n", len(products))

	log.Println("✅ Database seeding completed!")
	log.Println("\n📝 Demo Credentials:")
	log.Println("   Email: user1@example.com")
	log.Println("   Password: password123")
}

func seedUsers(ctx context.Context, repo *mongoRepo.UserRepository) []*entity.User {
	users := make([]*entity.User, 0, 10)

	for i := 1; i <= 10; i++ {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

		user := &entity.User{
			Email:        fmt.Sprintf("user%d@example.com", i),
			Username:     fmt.Sprintf("user%d", i),
			PasswordHash: string(hashedPassword),
			FirstName:    fmt.Sprintf("First%d", i),
			LastName:     fmt.Sprintf("Last%d", i),
			Preferences: entity.UserPreferences{
				Categories: []string{},
				PriceRange: entity.PriceRange{Min: 0, Max: 1000},
			},
		}

		if err := repo.Create(ctx, user); err != nil {
			log.Printf("Failed to create user %d: %v\n", i, err)
			continue
		}

		users = append(users, user)
	}

	return users
}

func seedProducts(ctx context.Context, repo *mongoRepo.ProductRepository) []*entity.Product {
	categories := []string{"Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys"}

	products := make([]*entity.Product, 0, 50)

	productTemplates := map[string][]string{
		"Electronics": {
			"Wireless Gaming Mouse", "Mechanical Keyboard", "4K Monitor",
			"USB-C Hub", "Webcam HD", "Wireless Earbuds", "Laptop Stand",
			"External SSD 1TB", "Gaming Headset", "Smart Watch",
		},
		"Clothing": {
			"Cotton T-Shirt", "Denim Jeans", "Running Shoes", "Winter Jacket",
			"Casual Shirt", "Yoga Pants", "Sneakers", "Hoodie",
			"Summer Dress", "Leather Belt",
		},
		"Books": {
			"Clean Code", "Design Patterns", "The Pragmatic Programmer",
			"Introduction to Algorithms", "Domain-Driven Design",
			"Refactoring", "Head First Design Patterns", "Code Complete",
		},
		"Home & Garden": {
			"Coffee Maker", "Blender", "Air Purifier", "LED Desk Lamp",
			"Plant Pot Set", "Garden Tools", "Indoor Plant", "Trash Can",
		},
		"Sports": {
			"Yoga Mat", "Dumbbells Set", "Jump Rope", "Resistance Bands",
			"Water Bottle", "Running Belt", "Gym Bag", "Foam Roller",
		},
		"Toys": {
			"Building Blocks", "Puzzle Game", "Remote Control Car",
			"Board Game", "Action Figure", "Stuffed Animal", "Art Set",
		},
	}

	rand.NewSource(time.Now().UnixNano())

	for _, category := range categories {
		templates := productTemplates[category]

		for _, name := range templates {
			basePrice := float64(rand.Intn(1000)) + 9.99

			product := &entity.Product{
				Name:        name,
				Description: fmt.Sprintf("High-quality %s for your needs. Perfect for everyday use with excellent durability and performance.", name),
				Category:    category,
				Price:       basePrice,
				Stock:       rand.Intn(100) + 1,
				Tags:        []string{category, "popular", "trending"},
				Rating:      float64(rand.Intn(5)) + 1.0 + rand.Float64(),
				ReviewCount: rand.Intn(100) + 1,
			}

			if product.Rating > 5.0 {
				product.Rating = 5.0
			}

			if err := repo.Create(ctx, product); err != nil {
				log.Printf("Failed to create product %s: %v\n", name, err)
				continue
			}

			products = append(products, product)
		}
	}

	return products
}
