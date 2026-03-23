package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5"
)

func main() {


	conn, err := pgx.Connect(context.Background(), "postgres://postgres:password@localhost:5432/payment_monitoring")
	if err != nil {
		log.Fatal("Connection failed:", err)
	}
	defer conn.Close(context.Background())

	fmt.Println("Connected to database!")


	rows, err := conn.Query(context.Background(), "SELECT amount, status, created_at FROM transactions")
	if err != nil {
		log.Fatal("Query failed:", err)
	}
	defer rows.Close()


	type Stats struct {
		totalTransactions  int
		totalAmount        float64
		failedTransactions int
	}

	dailyMap := make(map[string]*Stats)

	for rows.Next() {
		var status string
		var amount float64
		var createdAt time.Time

		err = rows.Scan(&amount, &status, &createdAt)
		if err != nil {
			log.Fatal("Scan failed:", err)
		}

		date := createdAt.Format("2006-01-02")

		if dailyMap[date] == nil {
			dailyMap[date] = &Stats{}
		}

		dailyMap[date].totalTransactions++
		dailyMap[date].totalAmount += amount
		if status == "FAILED" {
			dailyMap[date].failedTransactions++
		}
	}

	
	for date, stats := range dailyMap {

		successRate := float64(stats.totalTransactions-stats.failedTransactions) / float64(stats.totalTransactions) * 100

		_, err = conn.Exec(context.Background(), `
			INSERT INTO daily_summary (date, total_transactions, total_amount, failed_transactions, success_rate)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (date) DO UPDATE
				SET total_transactions  = $2,
				    total_amount        = $3,
				    failed_transactions = $4,
				    success_rate        = $5
		`, date, stats.totalTransactions, stats.totalAmount, stats.failedTransactions, successRate)

		if err != nil {
			log.Fatal("Insert failed:", err)
		}

		fmt.Printf("Saved: %s | Total: %d | Amount: %.2f | Failed: %d | Success Rate: %.2f%%\n",
			date,
			stats.totalTransactions,
			stats.totalAmount,
			stats.failedTransactions,
			successRate,
		)
	}

	fmt.Println("Done!")
}