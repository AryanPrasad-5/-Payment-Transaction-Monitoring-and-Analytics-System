package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"payment-monitor/internal/database"
	"payment-monitor/internal/grpcclient"
	"payment-monitor/internal/models"
)

const (
	StatusSuccess = "SUCCESS"
	StatusFailed  = "FAILED"

	PaymentUPI    = "UPI"
	PaymentCard   = "CARD"
	PaymentWallet = "WALLET"
)

type Handler struct {
	db   *database.DB
	grpc *grpcclient.Client

	mu             sync.Mutex
	totalIngested  int64
	totalSucceeded int64
	totalFailed    int64
	grpcErrors     int64
	dbErrors       int64
	startTime      time.Time
}

func New(db *database.DB, grpcClient *grpcclient.Client) *Handler {
	return &Handler{
		db:        db,
		grpc:      grpcClient,
		startTime: time.Now(),
	}
}

func (h *Handler) IngestTransaction(ctx *gin.Context) {
	var req models.IngestRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		respondError(ctx, http.StatusBadRequest, "Invalid JSON payload: "+err.Error())
		return
	}

	if errMsg := validateIngestRequest(req); errMsg != "" {
		respondError(ctx, http.StatusBadRequest, errMsg)
		return
	}

	txnID := "TXN-" + uuid.New().String()[:12]
	now := time.Now().UTC()

	h.mu.Lock()
	h.totalIngested++
	h.mu.Unlock()

	grpcResult, err := h.grpc.SendTransaction(
		txnID,
		req.MerchantID,
		req.Amount,
		req.Status,
		req.PaymentMethod,
	)
	if err != nil {
		log.Printf("[WARN] gRPC processing failed for %s: %v (storing anyway)", txnID, err)
		h.mu.Lock()
		h.grpcErrors++
		h.mu.Unlock()
	}

	tx := &models.Transaction{
		TransactionID: txnID,
		MerchantID:    req.MerchantID,
		Amount:        req.Amount,
		Status:        req.Status,
		PaymentMethod: req.PaymentMethod,
		CreatedAt:     now,
	}

	if err := h.db.InsertTransaction(tx); err != nil {
		log.Printf("[ERROR] DB insert failed for %s: %v", txnID, err)
		h.mu.Lock()
		h.dbErrors++
		h.mu.Unlock()
		respondError(ctx, http.StatusInternalServerError, "Failed to store transaction")
		return
	}

	isFailed := req.Status == StatusFailed
	if err := h.db.UpsertMerchantStats(req.MerchantID, req.Amount, isFailed); err != nil {
		log.Printf("[WARN] Failed to update merchant stats for %s: %v", req.MerchantID, err)
	}
	if err := h.db.UpsertDailySummary(now, req.Amount, isFailed); err != nil {
		log.Printf("[WARN] Failed to update daily summary: %v", err)
	}

	h.mu.Lock()
	if isFailed {
		h.totalFailed++
	} else {
		h.totalSucceeded++
	}
	h.mu.Unlock()

	response := gin.H{
		"message":        "Transaction ingested successfully",
		"transaction_id": txnID,
		"data":           tx,
	}
	if grpcResult != nil {
		response["processor"] = gin.H{
			"success": grpcResult.Success,
			"message": grpcResult.Message,
		}
	}

	ctx.JSON(http.StatusCreated, response)
}

func (h *Handler) GetTransactions(ctx *gin.Context) {
	filter := models.QueryFilter{
		MerchantID:    ctx.Query("merchant_id"),
		Status:        strings.ToUpper(ctx.Query("status")),
		PaymentMethod: strings.ToUpper(ctx.Query("payment_method")),
	}

	if limitStr := ctx.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			filter.Limit = l
		}
	}
	if offsetStr := ctx.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			filter.Offset = o
		}
	}

	transactions, err := h.db.GetTransactions(filter)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch transactions: %v", err)
		respondError(ctx, http.StatusInternalServerError, "Failed to fetch transactions")
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"count": len(transactions),
		"data":  transactions,
	})
}

func (h *Handler) GetTransactionByID(ctx *gin.Context) {
	txnID := ctx.Param("id")
	if txnID == "" {
		respondError(ctx, http.StatusBadRequest, "Transaction ID is required")
		return
	}

	tx, err := h.db.GetTransactionByID(txnID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch transaction %s: %v", txnID, err)
		respondError(ctx, http.StatusInternalServerError, "Failed to fetch transaction")
		return
	}
	if tx == nil {
		respondError(ctx, http.StatusNotFound, fmt.Sprintf("Transaction %s not found", txnID))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": tx,
	})
}

func (h *Handler) GetMerchantStats(ctx *gin.Context) {
	merchantID := ctx.Param("id")
	if merchantID == "" {
		respondError(ctx, http.StatusBadRequest, "Merchant ID is required")
		return
	}

	stats, err := h.db.GetMerchantStats(merchantID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch merchant stats for %s: %v", merchantID, err)
		respondError(ctx, http.StatusInternalServerError, "Failed to fetch merchant stats")
		return
	}
	if stats == nil {
		respondError(ctx, http.StatusNotFound, fmt.Sprintf("No stats found for merchant %s", merchantID))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}

func (h *Handler) GetDailySummaries(ctx *gin.Context) {
	fromStr := ctx.DefaultQuery("from", time.Now().AddDate(0, 0, -30).Format("2006-01-02"))
	toStr := ctx.DefaultQuery("to", time.Now().Format("2006-01-02"))

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		respondError(ctx, http.StatusBadRequest, "Invalid 'from' date format. Use YYYY-MM-DD")
		return
	}
	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		respondError(ctx, http.StatusBadRequest, "Invalid 'to' date format. Use YYYY-MM-DD")
		return
	}

	summaries, err := h.db.GetDailySummaries(from, to)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch daily summaries: %v", err)
		respondError(ctx, http.StatusInternalServerError, "Failed to fetch daily summaries")
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"from":  fromStr,
		"to":    toStr,
		"count": len(summaries),
		"data":  summaries,
	})
}

func (h *Handler) GetMetrics(ctx *gin.Context) {
	h.mu.Lock()
	defer h.mu.Unlock()

	uptime := time.Since(h.startTime).Truncate(time.Second)

	ctx.JSON(http.StatusOK, gin.H{
		"uptime_seconds":  uptime.Seconds(),
		"uptime_human":    uptime.String(),
		"total_ingested":  h.totalIngested,
		"total_succeeded": h.totalSucceeded,
		"total_failed":    h.totalFailed,
		"grpc_errors":     h.grpcErrors,
		"db_errors":       h.dbErrors,
	})
}

func validateIngestRequest(req models.IngestRequest) string {
	if req.MerchantID == "" {
		return "merchant_id is required"
	}
	if req.Amount <= 0 {
		return "amount must be greater than 0"
	}
	s := strings.ToUpper(req.Status)
	if s != StatusSuccess && s != StatusFailed {
		return "status must be either SUCCESS or FAILED"
	}
	m := strings.ToUpper(req.PaymentMethod)
	if m != PaymentUPI && m != PaymentCard && m != PaymentWallet {
		return "payment_method must be UPI, CARD, or WALLET"
	}
	return ""
}

func respondError(ctx *gin.Context, status int, errMsg string) {
	ctx.JSON(status, gin.H{
		"error": errMsg,
	})
}
