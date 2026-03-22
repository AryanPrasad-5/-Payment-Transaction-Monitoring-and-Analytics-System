use tonic::{Request, Response, Status};
use uuid::Uuid;
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

        // Basic validation
        if req.amount <= 0.0 {
            return Err(Status::invalid_argument("Amount must be greater than zero"));
        }
        if req.transaction_id.is_empty() || req.merchant_id.is_empty() {
            return Err(Status::invalid_argument("Transaction ID and Merchant ID are required"));
        }

        let is_success = req.status.to_uppercase() == "SUCCESS";
        let tx_id = Uuid::new_v4();

        // 1. Insert raw transaction
        let insert_tx_result = sqlx::query(
            r#"
            INSERT INTO transactions (id, transaction_id, merchant_id, amount, status, payment_method, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#
        )
        .bind(tx_id)
        .bind(&req.transaction_id)
        .bind(&req.merchant_id)
        .bind(req.amount)
        .bind(&req.status)
        .bind(&req.payment_method)
        .bind(Utc::now())
        .execute(&self.db.pool)
        .await;

        if let Err(e) = insert_tx_result {
            tracing::error!("Failed to insert transaction: {:?}", e);
            return Err(Status::internal("Database error"));
        }

        // 2. Update merchant stats (Upsert pattern)
        let failed_inc: i64 = if is_success { 0 } else { 1 };
        let volume_inc: f64 = if is_success { req.amount } else { 0.0 };

        let update_stats_result = sqlx::query(
            r#"
            INSERT INTO merchant_stats (merchant_id, total_transactions, failed_transactions, total_volume, updated_at)
            VALUES ($1, 1, $2, $3, $4)
            ON CONFLICT (merchant_id) DO UPDATE SET
                total_transactions = merchant_stats.total_transactions + 1,
                failed_transactions = merchant_stats.failed_transactions + $2,
                total_volume = merchant_stats.total_volume + $3,
                updated_at = $4
            "#
        )
        .bind(&req.merchant_id)
        .bind(failed_inc)
        .bind(volume_inc)
        .bind(Utc::now())
        .execute(&self.db.pool)
        .await;

        if let Err(e) = update_stats_result {
            tracing::error!("Failed to update merchant stats: {:?}", e);
            // Even if stats fail, we processed the tx successfully
        }

        Ok(Response::new(TransactionResponse {
            success: true,
            message: "Transaction processed successfully".to_string(),
        }))
    }
}
