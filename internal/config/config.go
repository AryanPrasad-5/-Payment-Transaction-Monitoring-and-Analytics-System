package config
import "os"

type Config struct {
	Port        string 
	DatabaseURL string 
	GRPCAddress string 
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"),
		GRPCAddress: getEnv("GRPC_ADDRESS", "localhost:50051"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
