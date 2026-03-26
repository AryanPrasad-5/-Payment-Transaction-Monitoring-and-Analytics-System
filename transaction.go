package models
type Transaction struct {
	TransactionID string `json:"transaction_id" binding:"required"`
	MerchantID string `json:"merchant_id" binding:"required"`
	Amount float64 `json:"amount" binding:"required"`
	Status string `json:"status" binding:"required"`
	PaymentMethod string `json:"payment_method"`
}