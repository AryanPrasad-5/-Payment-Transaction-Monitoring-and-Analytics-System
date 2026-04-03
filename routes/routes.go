package routes

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"payment-monitor/handlers"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"time":   time.Now().UTC().Format(time.RFC3339),
		})
	})

	v1 := router.Group("/api/v1")
	v1.Use(requestLogger())
	{
		transactions := v1.Group("/transactions")
		{
			transactions.POST("/", handlers.CreateTransaction)
			transactions.GET("/", handlers.GetTransactions)
			transactions.GET("/:id", handlers.GetTransaction)
		}
	}
}

func requestLogger() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		start := time.Now()

		ctx.Next()
		duration := time.Since(start)
		status := ctx.Writer.Status()

		level := "INFO"
		if status >= 500 {
			level = "ERROR"
		} else if status >= 400 {
			level = "WARN"
		}

		println("["+level+"]",
			ctx.Request.Method,
			ctx.Request.URL.Path,
			status,
			duration.String(),
		)
	}
}
