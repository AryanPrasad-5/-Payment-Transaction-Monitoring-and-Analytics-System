package models

import "time"
type Transaction struct {
	TransactionID string    `json:"transaction_id" db:"transaction_id"`
	MerchantID    string    `json:"merchant_id"    db:"merchant_id"`
	Amount        float64   `json:"amount"         db:"amount"`
	Status        string    `json:"status"         db:"status"`          
	PaymentMethod string    `json:"payment_method" db:"payment_method"`  
	CreatedAt     time.Time `json:"created_at"     db:"created_at"`
}
type MerchantStats struct {
	MerchantID         string  `json:"merchant_id"          db:"merchant_id"`
	TotalTransactions  int     `json:"total_transactions"   db:"total_transactions"`
	TotalAmount        float64 `json:"total_amount"         db:"total_amount"`
	FailedTransactions int     `json:"failed_transactions"  db:"failed_transactions"`
	SuccessRate        float64 `json:"success_rate"         db:"success_rate"` 
}
type DailySummary struct {
	Date               time.Time `json:"date"                 db:"date"`
	TotalTransactions  int       `json:"total_transactions"   db:"total_transactions"`
	TotalAmount        float64   `json:"total_amount"         db:"total_amount"`
	FailedTransactions int       `json:"failed_transactions"  db:"failed_transactions"`
	SuccessRate        float64   `json:"success_rate"         db:"success_rate"`
}
type IngestRequest struct {
	MerchantID    string  `json:"merchant_id"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
	PaymentMethod string  `json:"payment_method"`
}
type QueryFilter struct {
	MerchantID    string 
	Status        string 
	PaymentMethod string 
	Limit         int    
	Offset        int    
}