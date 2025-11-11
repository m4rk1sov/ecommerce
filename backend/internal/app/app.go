package app

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/m4rk1sov/ecommerce/config"
	v1 "github.com/m4rk1sov/ecommerce/internal/controller/http/v1"
	"github.com/m4rk1sov/ecommerce/internal/repository/mongodb"
	"github.com/m4rk1sov/ecommerce/internal/repository/neo4j"
	rediscache "github.com/m4rk1sov/ecommerce/internal/repository/redis"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"github.com/m4rk1sov/ecommerce/pkg/logger"
	neo4jdrv "github.com/neo4j/neo4j-go-driver/v5/neo4j"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.uber.org/zap"
)

// Run creates objects via constructors
func Run(cfg *config.Config) {

	l, err := logger.New(cfg.Log.Level, cfg.App.Env)
	if err != nil {
		log.Fatalf("Failed to create logger: %s", err.Error())
	}
	defer func(l *zap.SugaredLogger) {
		closeErr := logger.Close(l)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}(l)

	// MongoDB
	mongoOpts := options.Client().ApplyURI(cfg.MongoDB.URI)
	if cfg.MongoDB.User != "" {
		mongoOpts.SetAuth(options.Credential{Username: cfg.MongoDB.User, Password: cfg.MongoDB.Password})
	}
	//ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	//defer cancel()

	mongoClient, err := mongo.Connect(mongoOpts)
	if err != nil {
		l.Fatalf("mongo connect: %v", err)
	}
	defer func() { _ = mongoClient.Disconnect(context.Background()) }()
	mdb := mongoClient.Database(cfg.MongoDB.Database)

	// Redis
	rdb := redis.NewClient(&redis.Options{Addr: cfg.Redis.Addr, Password: cfg.Redis.Password, DB: cfg.Redis.DB})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		l.Fatalf("redis ping: %v", err)
	}
	defer func() { _ = rdb.Close() }()

	// Neo4j
	driver, err := neo4jdrv.NewDriverWithContext(cfg.Neo4j.URI, neo4jdrv.BasicAuth(cfg.Neo4j.User, cfg.Neo4j.Password, ""))
	if err != nil {
		l.Fatalf("neo4j connect: %v", err)
	}
	defer func() { _ = driver.Close(context.Background()) }()

	// Repositories
	userRepo := mongodb.NewUserRepository(mdb)
	productRepo := mongodb.NewProductRepository(mdb)
	interactionRepo := mongodb.NewInteractionRepository(mdb)
	cacheRepo := rediscache.NewCacheRepository(rdb)
	sessionRepo := rediscache.NewSessionRepository(rdb)
	graphRepo := neo4j.NewGraphRepository(driver)

	// Use cases
	userUC := usecase.NewUserUseCase(userRepo, sessionRepo, cfg.JWT.Secret, cfg.JWT.Expiration)
	productUC := usecase.NewProductUseCase(productRepo, cacheRepo)
	interactionUC := usecase.NewInteractionUseCase(interactionRepo, graphRepo)

	// TODO: implement RecommendationUseCase; for now, provide a minimal stub to satisfy router
	recUC := usecase.NewRecommendationUseCase(userRepo, productRepo, interactionRepo, cacheRepo, graphRepo, cfg.)

	// HTTP
	r := gin.Default()

	// Inject middleware with cfg secret
	authMw := v1.AuthMiddleware(cfg.JWT.Secret)

	// Build v1 routes
	v1.NewRouterWithMiddleware(r, &v1.UseCases{
		User:           userUC,
		Product:        productUC,
		Interaction:    interactionUC,
		Recommendation: recUC,
	}, authMw)

	srv := &http.Server{Addr: ":" + cfg.HTTP.Port, Handler: r}
	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			l.Fatalf("http listen: %v", err)
		}
	}()

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		l.Infof("http shutdown error: %v", err)
	}
	fmt.Println("Server stopped")

	////	repo
	//pg, err := postgres.New(cfg.PG.URL, postgres.MaxPoolSize(cfg.PG.PoolMax))
	//if err != nil {
	//	l.Fatal(fmt.Errorf("app - Run - postgres.New: %w", err))
	//}
	//defer pg.Close()
	//
	////	use case
	//ecommerceUseCase := ecommerce.New(
	//	persistent.New(pg),
	//	webapi.New(),
	//)
	//
	//httpServer := httpserver.New(l, httpserver.Port(cfg.HTTP.Port))
	//http.NewRouter(httpServer.App, cfg, ecommerceUseCase, l)
	//
	//httpServer.Start()
	//
	//interrupt := make(chan os.Signal, 1)
	//signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)
	//
	//select {
	//case s := <-interrupt:
	//	l.Info("app - Run - signal: %s", s.String())
	//case err = <-httpServer.Notify():
	//	l.Error(fmt.Errorf("app - Run - httpServer.Notify: %w", err))
	//}
	//
	//err = httpServer.Shutdown()
	//if err != nil {
	//	l.Error(fmt.Errorf("app - Run - httpServer.Shutdown: %w", err))
	//}

}
