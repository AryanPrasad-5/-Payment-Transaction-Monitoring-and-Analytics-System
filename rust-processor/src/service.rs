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

        
        if req.amount <= 0.0 {
            return Err(Status::invalid_argument("Amount must be greater than zero"));
        }
        if req.transaction_id.is_empty() || req.merchant_id.is_empty() {
            return Err(Status::invalid_argument("Transaction ID and Merchant ID are required"));
        }

        let is_success = req.status.eq_ignore_ascii_case("SUCCESS");
        let tx_id = Uuid::new_v4();
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
        .bind(now)
        .execute(&mut *tx)
        .await;

        if let Err(e) = insert_tx_result {
            tracing::error!("Failed to insert transaction: {:?}", e);
            let _ = tx.rollback().await; // Ignore rollback errors
            return Err(Status::internal("Database error"));
        }

       
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
        .bind(now)
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
