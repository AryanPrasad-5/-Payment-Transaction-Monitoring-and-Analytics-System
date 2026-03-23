package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
)

func main() {
	conn, err := pgx.Connect(context.Background(), "postgres://postgres:password@localhost:5432/payment_monitoring")
	if err != nil {
		log.Fatal("Connection failed:", err)
	}
	defer conn.Close(context.Background())

	fmt.Println("Connected to database!")


	rows, err := conn.Query(context.Background(), "SELECT merchant_id, amount, status FROM transactions")
	if err != nil {
		log.Fatal("Query failed:", err)
	}
	defer rows.Close()

	type Stats struct {
		totalTransactions  int
		totalAmount        float64
		failedTransactions int
	}

	merchantMap := make(map[string]*Stats)

	for rows.Next() {
		var merchantID, status string
		var amount float64

		err = rows.Scan(&merchantID, &amount, &status)
		if err != nil {
			log.Fatal("Scan failed:", err)
		}

		if merchantMap[merchantID] == nil {
			merchantMap[merchantID] = &Stats{}
		}

		merchantMap[merchantID].totalTransactions++
		merchantMap[merchantID].totalAmount += amount
		if status == "FAILED" {
			merchantMap[merchantID].failedTransactions++
		}
	}

	
	for merchantID, stats := range merchantMap {

		successRate := float64(stats.totalTransactions-stats.failedTransactions) / float64(stats.totalTransactions) * 100

		_, err = conn.Exec(context.Background(), `
			INSERT INTO merchant_stats (merchant_id, total_transactions, total_amount, failed_transactions, success_rate)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (merchant_id) DO UPDATE
				SET total_transactions  = $2,
				    total_amount        = $3,
				    failed_transactions = $4,
				    success_rate        = $5
		`, merchantID, stats.totalTransactions, stats.totalAmount, stats.failedTransactions, successRate)

		if err != nil {
			log.Fatal("Insert failed:", err)
		}

		fmt.Printf("Saved: %s | Total: %d | Amount: %.2f | Failed: %d | Success Rate: %.2f%%\n",
			merchantID,
			stats.totalTransactions,
			stats.totalAmount,
			stats.failedTransactions,
			successRate,
		)
	}

	fmt.Println("Done!")
}