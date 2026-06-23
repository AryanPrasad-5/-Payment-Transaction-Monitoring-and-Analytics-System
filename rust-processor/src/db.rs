use sqlx::{postgres::PgPoolOptions, PgPool};
use std::env;

#[derive(Clone)]
pub struct Db {
    pub pool: PgPool,
}

impl Db {
    pub async fn new() -> Result<Self, sqlx::Error> {
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/postgres".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(50)
            .connect(&database_url)
            .await?;
            
        // Migrations are handled by the Go Gateway on startup
        // sqlx::migrate!("./migrations").run(&pool).await?;

        Ok(Db { pool })
    }
}
