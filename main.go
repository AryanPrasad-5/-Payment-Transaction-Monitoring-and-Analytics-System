package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"payment-monitor/internal/config"
	"payment-monitor/internal/database"
	"payment-monitor/internal/grpcclient"
	"payment-monitor/internal/handlers"
	"payment-monitor/internal/server"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found — using system environment variables")
	}

	cfg := config.Load()

	log.Printf("=== Payment Transaction Monitor ===")
	log.Printf("  Port:         %s", cfg.Port)
	log.Printf("  gRPC target:  %s", cfg.GRPCAddress)
	log.Printf("  DB:           %s", maskDSN(cfg.DatabaseURL))

	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	if err := db.Migrate(); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	grpcClient, err := grpcclient.NewClient(cfg.GRPCAddress)
	if err != nil {
		log.Printf("[WARN] gRPC client creation failed: %v", err)
		log.Printf("[WARN] Transaction processing via gRPC will be unavailable.")
	} else {
		log.Printf("[INFO] gRPC client ready (will connect to processor on first request)")
	}

	h := handlers.New(db, grpcClient)
	srv := server.New(cfg.Port, h)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("HTTP server error: %v", err)
		}
	}()

	<-quit
	log.Println("Shutdown signal received...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Graceful shutdown error: %v", err)
	}

	if grpcClient != nil {
		grpcClient.Close()
	}

	log.Println("Server stopped.")
}

func maskDSN(dsn string) string {
	if len(dsn) > 30 {
		return dsn[:30] + "..."
	}
	return dsn
}
