package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"payment-monitor/db"
	"payment-monitor/models"
)

const (
	StatusSuccess = "SUCCESS"
	StatusFailed  = "FAILED"

	PaymentUPI    = "UPI"
	PaymentCard   = "CARD"
	PaymentWallet = "WALLET"
)

func CreateTransaction(ctx *gin.Context) {
	var tx models.Transaction
	if err := ctx.ShouldBindJSON(&tx); err != nil {
		respondError(ctx, http.StatusBadRequest, "Invalid request: "+err.Error())
		return
	}
	if errMsg := validateTransaction(tx); errMsg != "" {
		respondError(ctx, http.StatusBadRequest, errMsg)
		return
	}

	if result := db.DB.Create(&tx); result.Error != nil {
		respondError(ctx, http.StatusInternalServerError, "Failed to save transaction: "+result.Error.Error())
		return
	}

	respondSuccess(ctx, http.StatusCreated, "Transaction created successfully", tx)
}

func GetTransactions(ctx *gin.Context) {
	var transactions []models.Transaction
	query := db.DB

	if status := ctx.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if method := ctx.Query("payment_method"); method != "" {
		query = query.Where("payment_method = ?", method)
	}

	if result := query.Order("created_at DESC").Find(&transactions); result.Error != nil {
		respondError(ctx, http.StatusInternalServerError, "Failed to fetch transactions: "+result.Error.Error())
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"count": len(transactions),
		"data":  transactions,
	})
}

func GetTransaction(ctx *gin.Context) {
	txID := ctx.Param("id")

	var tx models.Transaction
	if result := db.DB.Where("transaction_id = ?", txID).First(&tx); result.Error != nil {
		respondError(ctx, http.StatusNotFound, "Transaction not found")
		return
	}

	respondSuccess(ctx, http.StatusOK, "Transaction retrieved", tx)
}

func validateTransaction(tx models.Transaction) string {
	if tx.Amount <= 0 {
		return "amount must be greater than 0"
	}

	if tx.Status != StatusSuccess && tx.Status != StatusFailed {
		return "status must be either SUCCESS or FAILED"
	}

	if tx.PaymentMethod != "" &&
		tx.PaymentMethod != PaymentUPI &&
		tx.PaymentMethod != PaymentCard &&
		tx.PaymentMethod != PaymentWallet {
		return "payment_method must be UPI, CARD, or WALLET"
	}

	return ""
}

func respondSuccess(ctx *gin.Context, status int, message string, data any) {
	ctx.JSON(status, gin.H{
		"message": message,
		"data":    data,
	})
}

func respondError(ctx *gin.Context, status int, errMsg string) {
	ctx.JSON(status, gin.H{
		"error": errMsg,
	})
}
