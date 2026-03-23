package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"github.com/jackc/pgx/v5"
)

type Transaction struct {
	TransactionID string  `json:"transaction_id"`
	MerchantID    string  `json:"merchant_id"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
	PaymentMethod string  `json:"payment_method"`
}

func main() {

	conn, err := pgx.Connect(context.Background(), "postgres://postgres:password@localhost:5432/payment_monitoring")
	if err != nil {
		log.Fatal("Connection failed:", err)
	}
	defer conn.Close(context.Background())

	rows, err := conn.Query(context.Background(), "SELECT transaction_id, merchant_id, amount, status, payment_method FROM transactions")
	if err != nil {
		log.Fatal("Query failed:", err)
	}
	defer rows.Close()

	var transactions []Transaction

	for rows.Next() {
		var t Transaction
		err = rows.Scan(&t.TransactionID, &t.MerchantID, &t.Amount, &t.Status, &t.PaymentMethod)
		if err != nil {
			log.Fatal("Scan failed:", err)
		}
		transactions = append(transactions, t)
	}


	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	encoder.Encode(transactions)
}