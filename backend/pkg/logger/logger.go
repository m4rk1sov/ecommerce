package logger

import (
	"go.uber.org/zap"
)

//var Log *zap.SugaredLogger

// New - Initialize logger
func New(level, env string) (*zap.SugaredLogger, error) {
	var config zap.Config

	if env == "production" {
		config = zap.NewProductionConfig()
	} else {
		config = zap.NewDevelopmentConfig()
	}

	// Set the logger level
	switch level {
	case "debug":
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "info":
		config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	case "warn":
		config.Level = zap.NewAtomicLevelAt(zap.WarnLevel)
	case "error":
		config.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)
	default:
		config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	logger, err := config.Build()
	if err != nil {
		return nil, err
	}

	log := logger.Sugar()
	return log, nil
}

// Close logger
func Close(l *zap.SugaredLogger) error {
	if l != nil {
		err := l.Sync()
		if err != nil {
			return err
		}
	}
	return nil
}
