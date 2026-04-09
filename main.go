package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"payment-monitor/db"
	"payment-monitor/grpcclient"
	"payment-monitor/handlers"
	"payment-monitor/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dsn := getEnv("DATABASE_URL", "")
	if dsn == "" {
		log.Fatal("DATABASE_URL is required")
	}
	db.Connect(dsn)
	grpcAddress := getEnv("GRPC_ADDRESS", "localhost:50051")
	grpcClient, err := grpcclient.NewClient(grpcAddress)
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server at %s: %v", grpcAddress, err)
	}
	defer grpcClient.Close() 
	h := handlers.New(grpcClient)

	port := getEnv("PORT", "8080")
	gin.SetMode(getEnv("GIN_MODE", gin.DebugMode))
	log.Printf("Starting server | mode=%s port=%s grpc=%s",
		getEnv("GIN_MODE", gin.DebugMode), port, grpcAddress)

	router := gin.Default()
	routes.SetupRoutes(router, h)

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
