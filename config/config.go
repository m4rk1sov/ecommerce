package config

type (
	Config struct {
		App     App
		HTTP    HTTP
		Log     Log
		PG      PG
		Swagger Swagger
	}
	
	App struct {
		Name    string `env:"APP_NAME,required"`
		Version string `env:"APP_VERSION,required"`
	}
	
	HTTP struct {
		Port string `env:"HTTP_PORT,required"`
	}
)
