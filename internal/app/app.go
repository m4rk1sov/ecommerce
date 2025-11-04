package app

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/m4rk1sov/ecommerce/config"
)

// Run creates objects via constructors
func Run(cfg *config.Config) {

	l := logger.New(cfg.Log.Level)

	//	repo
	pg, err := postgres.New(cfg.PG.URL, postgres.MaxPoolSize(cfg.PG.PoolMax))
	if err != nil {
		l.Fatal(fmt.Errorf("app - Run - postgres.New: %w", err))
	}
	defer pg.Close()

	//	use case
	translationUseCase := translation.New(
		persistent.New(pg),
		webapi.New(),
	)

	httpServer := httpserver.New(l, httpserver.Port(cfg.HTTP.Port))
	http.NewRouter(httpServer.App, cfg, translationUseCase, l)

	httpServer.Start()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	select {
	case s := <-interrupt:
		l.Info("app - Run - signal: %s", s.String())
	case err = <-httpServer.Notify():
		l.Error(fmt.Errorf("app - Run - httpServer.Notify: %w", err))
	}

	err = httpServer.Shutdown()
	if err != nil {
		l.Error(fmt.Errorf("app - Run - httpServer.Shutdown: %w", err))
	}

}
