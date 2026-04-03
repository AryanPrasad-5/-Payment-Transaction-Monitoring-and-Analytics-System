package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"payment-monitor/db"
	"payment-monitor/routes"
)

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	dsn := getEnv("DATABASE_URL", "")
	if dsn == "" {
		log.Fatal("DATABASE_URL is required. Set it in .env or as an environment variable.")
	}
	db.Connect(dsn)

	port := getEnv("PORT", "8080")
	gin.SetMode(getEnv("GIN_MODE", gin.DebugMode))

	log.Printf("Starting server | mode=%s port=%s", getEnv("GIN_MODE", gin.DebugMode), port)

	router := gin.Default()
	routes.SetupRoutes(router)

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