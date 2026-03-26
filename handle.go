package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
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
	respondSuccess(ctx, http.StatusOK, "Transaction received successfully", tx)
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