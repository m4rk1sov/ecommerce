package app

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
	
	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/config"
	v1 "github.com/m4rk1sov/ecommerce/internal/controller/http/v1"
	mongorepo "github.com/m4rk1sov/ecommerce/internal/repository/mongodb"
	neo4jrepo "github.com/m4rk1sov/ecommerce/internal/repository/neo4j"
	redisrepo "github.com/m4rk1sov/ecommerce/internal/repository/redis"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"github.com/m4rk1sov/ecommerce/pkg/httpserver"
	"github.com/m4rk1sov/ecommerce/pkg/logger"
	"go.uber.org/zap"
)

// Run creates objects via constructors
func Run(cfg *config.Config) {
	
	l, err := logger.New(cfg.Log.Level, cfg.App.Env)
	if err != nil {
		log.Fatalf("Failed to create logger: %v\n", err)
	}
	defer func(l *zap.SugaredLogger) {
		closeErr := logger.Close(l)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
			l.Errorf("failed to close logger: %v\n", err)
		}
	}(l)
	
	l.Infow("Starting the application",
		"name", cfg.App.Name,
		"version", cfg.App.Version,
	)
	
	// Initialize databases
	mongoClient, mdb := mongorepo.InitMongoDB(l, cfg)
	defer func() {
		closeErr := mongorepo.Close(mongoClient, context.Background())
		if closeErr != nil {
			err = errors.Join(err, closeErr)
			l.Errorf("failed to close mongodb: %v\n", err)
		}
	}()
	redisClient := redisrepo.InitRedis(l, cfg)
	defer func() {
		closeErr := redisrepo.Close(redisClient)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
			l.Errorf("failed to close redis: %v\n", err)
		}
	}()
	
	neo4jDriver := neo4jrepo.InitNeo4j(l, cfg)
	defer func() {
		closeErr := neo4jrepo.Close(neo4jDriver, context.Background())
		if closeErr != nil {
			err = errors.Join(err, closeErr)
			l.Errorf("failed to close neo4j: %v\n", err)
		}
	}()
	
	// Repositories
	userRepo := mongorepo.NewUserRepository(mdb)
	productRepo := mongorepo.NewProductRepository(mdb)
	interactionRepo := mongorepo.NewInteractionRepository(mdb)
	cacheRepo := redisrepo.NewCacheRepository(redisClient)
	sessionRepo := redisrepo.NewSessionRepository(redisClient)
	graphRepo := neo4jrepo.NewGraphRepository(neo4jDriver)
	
	// Use cases
	userUC := usecase.NewUserUseCase(userRepo, sessionRepo, cfg.JWT.Secret, cfg.JWT.Expiration)
	productUC := usecase.NewProductUseCase(productRepo, cacheRepo)
	interactionUC := usecase.NewInteractionUseCase(interactionRepo, graphRepo)
	
	recommendationUC := usecase.NewRecommendationUseCase(
		userRepo,
		productRepo,
		interactionRepo,
		cacheRepo,
		graphRepo,
		cfg.Interaction.CacheTTL,
		cfg.Interaction.MinInteractions,
	)
	
	// HTTP
	//r := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	
	// Inject middleware with cfg secret
	authMw := v1.AuthMiddleware(cfg.JWT.Secret)
	
	// Build v1 routes
	v1.NewRouterWithMiddleware(l, router, &v1.UseCases{
		User:           userUC,
		Product:        productUC,
		Interaction:    interactionUC,
		Recommendation: recommendationUC,
	}, authMw)
	
	srv := httpserver.New(router, cfg.HTTP.Port)
	l.Infow("HTTP server starting", "port", cfg.HTTP.Port)
	
	go func() {
		if err = srv.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			l.Fatalw("Failed to start http server", "error", err)
		}
	}()
	
	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	
	l.Info("Stopping http server...")
	
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	
	if err = srv.Shutdown(shutdownCtx); err != nil {
		l.Errorw("http shutdown error", "error", err)
	}
	l.Info("Server stopped")
}
