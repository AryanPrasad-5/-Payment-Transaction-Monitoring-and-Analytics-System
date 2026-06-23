use tonic::transport::Server;
use tracing_subscriber;

mod db;
mod service;

use service::payment::transaction_service_server::TransactionServiceServer;
use service::PaymentService;
use db::Db;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    tracing::info!("Starting Rust Transaction Processor...");

    let db = Db::new().await.unwrap_or_else(|e| {
        tracing::error!("Failed to connect to database: {:?}", e);
        std::process::exit(1);
    });
    tracing::info!("Connected to PostgreSQL and applied migrations.");

    let addr = "0.0.0.0:50051".parse()?;
    let payment_service = PaymentService { db };

    tracing::info!("gRPC server listening on {}", addr);

    Server::builder()
        .add_service(TransactionServiceServer::new(payment_service))
        .serve(addr)
        .await?;

    Ok(())
}
