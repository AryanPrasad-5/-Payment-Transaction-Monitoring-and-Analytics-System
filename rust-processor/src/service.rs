use tonic::{Request, Response, Status};
use chrono::Utc;

pub mod payment {
    tonic::include_proto!("payment");
}

use payment::transaction_service_server::TransactionService;
use payment::{TransactionRequest, TransactionResponse};
use crate::db::Db;

pub struct PaymentService {
    pub db: Db,
}

#[tonic::async_trait]
impl TransactionService for PaymentService {
    async fn process_transaction(
        &self,
        request: Request<TransactionRequest>,
    ) -> Result<Response<TransactionResponse>, Status> {
        let req = request.into_inner();

        
        if req.amount <= 0.0 {
            return Err(Status::invalid_argument("Amount must be greater than zero"));
        }
        if req.transaction_id.is_empty() || req.merchant_id.is_empty() {
            return Err(Status::invalid_argument("Transaction ID and Merchant ID are required"));
        }

<<<<<<< HEAD
        let is_success = req.status.to_uppercase() == "SUCCESS";
=======
        let is_success = req.status.eq_ignore_ascii_case("SUCCESS");
        let tx_id = Uuid::new_v4();
>>>>>>> origin/main
        let now = Utc::now();

        
        let mut tx = match self.db.pool.begin().await {
            Ok(t) => t,
            Err(e) => {
                tracing::error!("Failed to begin transaction: {:?}", e);
                return Err(Status::internal("Database error"));
            }
        };

        
        let insert_tx_result = sqlx::query(
            r#"
            INSERT INTO transactions (transaction_id, merchant_id, amount, status, payment_method, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#
        )
        .bind(&req.transaction_id)
        .bind(&req.merchant_id)
        .bind(req.amount)
        .bind(&req.status)
        .bind(&req.payment_method)
        .bind(now)
        .execute(&mut *tx)
        .await;

        if let Err(e) = insert_tx_result {
            tracing::error!("Failed to insert transaction: {:?}", e);
            let _ = tx.rollback().await; // Ignore rollback errors
            return Err(Status::internal("Database error"));
        }

        let failed_int: i32 = if is_success { 0 } else { 1 };
        let success_rate: f64 = if is_success { 100.0 } else { 0.0 };

        let success_rate: f64 = if is_success { 100.0 } else { 0.0 };

        let update_stats_result = sqlx::query(
            r#"
<<<<<<< HEAD
            INSERT INTO merchant_stats (merchant_id, total_transactions, failed_transactions, total_amount, success_rate)
            VALUES ($1, 1, $2, $3, $4)
            ON CONFLICT (merchant_id) DO UPDATE SET
                total_transactions = merchant_stats.total_transactions + 1,
                failed_transactions = merchant_stats.failed_transactions + $2,
                total_amount = merchant_stats.total_amount + $3,
                success_rate = CASE WHEN (merchant_stats.total_transactions + 1) > 0
                    THEN ((merchant_stats.total_transactions + 1 - (merchant_stats.failed_transactions + $2))::float / (merchant_stats.total_transactions + 1)::float) * 100.0
                    ELSE 0.0 END
            "#
        )
        .bind(&req.merchant_id)
        .bind(failed_inc)
        .bind(volume_inc)
=======
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
            "#
        )
        .bind(&req.merchant_id)
        .bind(req.amount)
        .bind(failed_int)
>>>>>>> origin/main
        .bind(success_rate)
        .execute(&mut *tx)
        .await;

        if let Err(e) = update_stats_result {
            tracing::error!("Failed to update merchant stats: {:?}", e);
            let _ = tx.rollback().await;
            return Err(Status::internal("Database error"));
        }

        
        if let Err(e) = tx.commit().await {
            tracing::error!("Failed to commit database transaction: {:?}", e);
            return Err(Status::internal("Database error"));
        }

        Ok(Response::new(TransactionResponse {
            success: true,
            message: "Transaction processed successfully".to_string(),
        }))
    }
}
