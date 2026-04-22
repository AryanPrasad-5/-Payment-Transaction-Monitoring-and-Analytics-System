package server

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"payment-monitor/internal/handlers"
)

type Server struct {
	router     *gin.Engine
	httpServer *http.Server
	handler    *handlers.Handler
}

func New(port string, h *handlers.Handler) *Server {
	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(corsMiddleware())
	router.Use(requestLogger())

	s := &Server{
		router:  router,
		handler: h,
		httpServer: &http.Server{
			Addr:         ":" + port,
			Handler:      router,
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  30 * time.Second,
		},
	}

	s.registerRoutes()
	return s
}

func (s *Server) registerRoutes() {
	s.router.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "payment-monitor",
			"time":    time.Now().UTC().Format(time.RFC3339),
		})
	})

	s.router.GET("/metrics", s.handler.GetMetrics)

	v1 := s.router.Group("/api/v1")
	{
		txn := v1.Group("/transactions")
		{
			txn.POST("/", s.handler.IngestTransaction)
			txn.GET("/", s.handler.GetTransactions)
			txn.GET("/:id", s.handler.GetTransactionByID)
		}

		merchants := v1.Group("/merchants")
		{
			merchants.GET("/:id/stats", s.handler.GetMerchantStats)
		}

		analytics := v1.Group("/analytics")
		{
			analytics.GET("/daily", s.handler.GetDailySummaries)
		}
	}
}

func (s *Server) Start() error {
	log.Printf("HTTP server listening on %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("Shutting down HTTP server...")
	return s.httpServer.Shutdown(ctx)
}

func corsMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		ctx.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		ctx.Header("Access-Control-Max-Age", "86400")

		if ctx.Request.Method == http.MethodOptions {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}

		ctx.Next()
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

		log.Printf("[%s] %s %s → %d (%s)",
			level,
			ctx.Request.Method,
			ctx.Request.URL.Path,
			status,
			duration.Truncate(time.Microsecond),
		)
	}
}
