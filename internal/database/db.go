package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"
	_ "github.com/lib/pq"
	"payment-monitor/internal/models"
)

type DB struct {
	conn *sql.DB
}

func New(databaseURL string) (*DB, error) {
	conn, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open DB: %w", err)
	}
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("DB unreachable: %w", err)
	}
	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(5)
	conn.SetConnMaxLifetime(5 * time.Minute)

	log.Println(" PostgreSQL connected")
	return &DB{conn: conn}, nil
}

func (db *DB) Migrate() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS transactions (
			transaction_id  VARCHAR PRIMARY KEY,
			merchant_id     VARCHAR NOT NULL,
			amount          DECIMAL(15,2) NOT NULL,
			status          VARCHAR(10) NOT NULL CHECK (status IN ('SUCCESS','FAILED')),
			payment_method  VARCHAR(10) NOT NULL CHECK (payment_method IN ('UPI','CARD','WALLET')),
			created_at      TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_status   ON transactions(status)`,
		`CREATE INDEX IF NOT EXISTS idx_transactions_created  ON transactions(created_at DESC)`,

		`CREATE TABLE IF NOT EXISTS merchant_stats (
			merchant_id          VARCHAR PRIMARY KEY,
			total_transactions   INT NOT NULL DEFAULT 0,
			total_amount         DECIMAL(15,2) NOT NULL DEFAULT 0,
			failed_transactions  INT NOT NULL DEFAULT 0,
			success_rate         FLOAT NOT NULL DEFAULT 0
		)`,

		`CREATE TABLE IF NOT EXISTS daily_summary (
			date                 DATE PRIMARY KEY,
			total_transactions   INT NOT NULL DEFAULT 0,
			total_amount         DECIMAL(15,2) NOT NULL DEFAULT 0,
			failed_transactions  INT NOT NULL DEFAULT 0,
			success_rate         FLOAT NOT NULL DEFAULT 0
		)`,
	}

	for _, q := range queries {
		if _, err := db.conn.Exec(q); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	log.Println(" Database migrations applied")
	return nil
}

func (db *DB) InsertTransaction(tx *models.Transaction) error {
	query := `
		INSERT INTO transactions (transaction_id, merchant_id, amount, status, payment_method, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := db.conn.Exec(query,
		tx.TransactionID,
		tx.MerchantID,
		tx.Amount,
		tx.Status,
		tx.PaymentMethod,
		tx.CreatedAt,
	)
	return err
}
func (db *DB) GetTransactions(filter models.QueryFilter) ([]models.Transaction, error) {

	query := `SELECT transaction_id, merchant_id, amount, status, payment_method, created_at FROM transactions WHERE 1=1`
	args := []interface{}{}
	argIdx := 1

	if filter.MerchantID != "" {
		query += fmt.Sprintf(" AND merchant_id = $%d", argIdx)
		args = append(args, filter.MerchantID)
		argIdx++
	}
	if filter.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.PaymentMethod != "" {
		query += fmt.Sprintf(" AND payment_method = $%d", argIdx)
		args = append(args, filter.PaymentMethod)
		argIdx++
	}

	query += " ORDER BY created_at DESC"

	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
	query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, filter.Offset)

	rows, err := db.conn.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []models.Transaction
	for rows.Next() {
		var tx models.Transaction
		if err := rows.Scan(
			&tx.TransactionID,
			&tx.MerchantID,
			&tx.Amount,
			&tx.Status,
			&tx.PaymentMethod,
			&tx.CreatedAt,
		); err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}
	return transactions, rows.Err()
}

func (db *DB) GetTransactionByID(id string) (*models.Transaction, error) {
	query := `SELECT transaction_id, merchant_id, amount, status, payment_method, created_at FROM transactions WHERE transaction_id = $1`
	var tx models.Transaction
	err := db.conn.QueryRow(query, id).Scan(
		&tx.TransactionID,
		&tx.MerchantID,
		&tx.Amount,
		&tx.Status,
		&tx.PaymentMethod,
		&tx.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

func (db *DB) UpsertMerchantStats(merchantID string, amount float64, failed bool) error {
	query := `
		INSERT INTO merchant_stats (merchant_id, total_transactions, total_amount, failed_transactions, success_rate)
		VALUES ($1, 1, $2, $3, $4)
		ON CONFLICT (merchant_id) DO UPDATE SET
			total_transactions  = merchant_stats.total_transactions + 1,
			total_amount        = merchant_stats.total_amount + $2,
			failed_transactions = merchant_stats.failed_transactions + $3,
			success_rate        = ROUND(
				(CAST(merchant_stats.total_transactions + 1 - merchant_stats.failed_transactions - $3 AS FLOAT)
				/ CAST(merchant_stats.total_transactions + 1 AS FLOAT)) * 100,
				2
			)
	`
	failedInt := 0
	successRate := 100.0
	if failed {
		failedInt = 1
		successRate = 0.0
	}
	_, err := db.conn.Exec(query, merchantID, amount, failedInt, successRate)
	return err
}

func (db *DB) GetMerchantStats(merchantID string) (*models.MerchantStats, error) {
	query := `SELECT merchant_id, total_transactions, total_amount, failed_transactions, success_rate FROM merchant_stats WHERE merchant_id = $1`
	var ms models.MerchantStats
	err := db.conn.QueryRow(query, merchantID).Scan(
		&ms.MerchantID,
		&ms.TotalTransactions,
		&ms.TotalAmount,
		&ms.FailedTransactions,
		&ms.SuccessRate,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ms, err
}

func (db *DB) UpsertDailySummary(date time.Time, amount float64, failed bool) error {
	day := date.Truncate(24 * time.Hour)
	failedInt := 0
	if failed {
		failedInt = 1
	}
	query := `
		INSERT INTO daily_summary (date, total_transactions, total_amount, failed_transactions, success_rate)
		VALUES ($1, 1, $2, $3, $4)
		ON CONFLICT (date) DO UPDATE SET
			total_transactions  = daily_summary.total_transactions + 1,
			total_amount        = daily_summary.total_amount + $2,
			failed_transactions = daily_summary.failed_transactions + $3,
			success_rate        = ROUND(
				(CAST(daily_summary.total_transactions + 1 - daily_summary.failed_transactions - $3 AS FLOAT)
				/ CAST(daily_summary.total_transactions + 1 AS FLOAT)) * 100,
				2
			)
	`
	successRate := 100.0
	if failed {
		successRate = 0.0
	}
	_, err := db.conn.Exec(query, day, amount, failedInt, successRate)
	return err
}

func (db *DB) GetDailySummaries(from, to time.Time) ([]models.DailySummary, error) {
	query := `
		SELECT date, total_transactions, total_amount, failed_transactions, success_rate
		FROM daily_summary
		WHERE date BETWEEN $1 AND $2
		ORDER BY date DESC
	`
	rows, err := db.conn.Query(query, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []models.DailySummary
	for rows.Next() {
		var ds models.DailySummary
		if err := rows.Scan(&ds.Date, &ds.TotalTransactions, &ds.TotalAmount, &ds.FailedTransactions, &ds.SuccessRate); err != nil {
			return nil, err
		}
		summaries = append(summaries, ds)
	}
	return summaries, rows.Err()
}
