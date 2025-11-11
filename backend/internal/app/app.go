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
	mongorepo "github.com/m4rk1sov/ecommerce/internal/repository/mongodb"
	neo4jrepo "github.com/m4rk1sov/ecommerce/internal/repository/neo4j"
	redisrepo "github.com/m4rk1sov/ecommerce/internal/repository/redis"
	"github.com/m4rk1sov/ecommerce/internal/usecase"
	"github.com/m4rk1sov/ecommerce/pkg/logger"
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
			l.Errorf("failed to close logger: %s", err.Error())
		}
	}(l)

	// Initialize databases
	mongoClient, mdb := mongorepo.InitMongoDB(l, cfg)
	redisClient := redisrepo.InitRedis(l, cfg)
	neo4jDriver := neo4jrepo.InitNeo4j(l, cfg)

	defer func() {
		closeErr := mongorepo.Close(mongoClient, context.Background())
		if closeErr != nil {
			err = errors.Join(err, closeErr)
			//l.Errorf()
		}
	}()
	defer func() {
		closeErr := redisrepo.Close(redisClient)
		if closeErr != nil {
			err = errors.Join(err, closeErr)
		}
	}()
	defer func() {
		closeErr := neo4jrepo.Close(neo4jDriver, context.Background())
		if closeErr != nil {
			err = errors.Join(err, closeErr)
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

	// TODO: implement RecommendationUseCase; for now, provide a minimal stub to satisfy router
	recUC := usecase.NewRecommendationUseCase(userRepo, productRepo, interactionRepo, cacheRepo, graphRepo, cfg.Interaction.CacheTTL, cfg.Interaction.MinInteractions)

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
