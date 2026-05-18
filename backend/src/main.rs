mod db;
mod handlers;
mod models;

use axum::{
    routing::{delete, get, patch, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

use handlers::photo_handlers::{
    add_photo_from_url, delete_photo, get_all_photos, get_photos, update_visibility, upload_photo,
};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let db_path = std::env::var("DATABASE_URL").unwrap_or_else(|_| "photo_wall.db".to_string());
    db::init_db(std::path::Path::new(&db_path)).expect("Failed to initialize database");

    let uploads_dir = std::env::var("UPLOADS_DIR").unwrap_or_else(|_| "uploads".to_string());
    std::fs::create_dir_all(&uploads_dir).expect("Failed to create uploads directory");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/photos", get(get_photos))
        .route("/api/photos/all", get(get_all_photos))
        .route("/api/photos/upload", post(upload_photo))
        .route("/api/photos/url", post(add_photo_from_url))
        .route("/api/photos/:id", delete(delete_photo))
        .route("/api/photos/:id/visibility", patch(update_visibility))
        .route_service("/uploads", ServeDir::new(&uploads_dir))
        .layer(cors);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    println!("🚀 Photo Wall Server running on http://{}", addr);
    println!("📁 API: http://{}/api/photos", addr);
    println!("📂 Uploads: http://{}/uploads", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
