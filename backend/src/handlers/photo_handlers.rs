use axum::{
    extract::Path,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use axum::extract::Multipart;
use rusqlite::params;
use uuid::Uuid;

use crate::db::get_connection;
use crate::models::photo::{
    ApiResponse, CreatePhotoFromUrl, Photo, PhotoResponse, UpdateVisibility,
};

pub async fn get_photos() -> impl IntoResponse {
    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let mut stmt = match conn.prepare(
        "SELECT id, filename, source_url, storage_path, is_public, created_at, updated_at 
         FROM photos WHERE is_public = 1 ORDER BY created_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let photo_iter = stmt.query_map([], |row| {
        Ok(Photo {
            id: row.get(0)?,
            filename: row.get(1)?,
            source_url: row.get(2)?,
            storage_path: row.get(3)?,
            is_public: row.get::<_, i32>(4)? == 1,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    });

    let photos: Vec<PhotoResponse> = match photo_iter {
        Ok(iter) => iter.filter_map(|r| r.ok()).map(PhotoResponse::from).collect(),
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    (StatusCode::OK, Json(ApiResponse::success(photos))).into_response()
}

pub async fn get_all_photos() -> impl IntoResponse {
    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let mut stmt = match conn.prepare(
        "SELECT id, filename, source_url, storage_path, is_public, created_at, updated_at 
         FROM photos ORDER BY created_at DESC",
    ) {
        Ok(s) => s,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let photo_iter = stmt.query_map([], |row| {
        Ok(Photo {
            id: row.get(0)?,
            filename: row.get(1)?,
            source_url: row.get(2)?,
            storage_path: row.get(3)?,
            is_public: row.get::<_, i32>(4)? == 1,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    });

    let photos: Vec<PhotoResponse> = match photo_iter {
        Ok(iter) => iter.filter_map(|r| r.ok()).map(PhotoResponse::from).collect(),
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<Vec<PhotoResponse>>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    (StatusCode::OK, Json(ApiResponse::success(photos))).into_response()
}

pub async fn upload_photo(mut multipart: Multipart) -> impl IntoResponse {
    let uploads_dir = std::env::var("UPLOADS_DIR").unwrap_or_else(|_| "uploads".to_string());
    let _ = std::fs::create_dir_all(&uploads_dir);

    let mut filename = String::new();
    let mut file_data: Vec<u8> = Vec::new();

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap_or("").to_string();
        if name == "file" {
            if let Some(fname) = field.file_name() {
                filename = fname.to_string();
            }
            if let Ok(data) = field.bytes().await {
                file_data = data.to_vec();
            }
        }
    }

    if filename.is_empty() || file_data.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<PhotoResponse>::error("No file provided")),
        )
            .into_response();
    }

    let ext = std::path::Path::new(&filename)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg");
    let unique_filename = format!("{}_{}.{}", chrono::Utc::now().timestamp(), Uuid::new_v4(), ext);
    let storage_path = std::path::Path::new(&uploads_dir).join(&unique_filename);

    if let Err(e) = std::fs::write(&storage_path, &file_data) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<PhotoResponse>::error(&format!("Failed to save file: {}", e))),
        )
            .into_response();
    }

    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            let _ = std::fs::remove_file(&storage_path);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<PhotoResponse>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    match conn.execute(
        "INSERT INTO photos (filename, storage_path, is_public) VALUES (?1, ?2, 1)",
        params![filename.clone(), unique_filename.clone()],
    ) {
        Ok(_) => {}
        Err(e) => {
            let _ = std::fs::remove_file(&storage_path);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<PhotoResponse>::error(&e.to_string())),
            )
                .into_response();
        }
    }

    let photo_id = conn.last_insert_rowid();
    let photo = Photo {
        id: photo_id,
        filename,
        source_url: None,
        storage_path: unique_filename,
        is_public: true,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };

    (StatusCode::OK, Json(ApiResponse::success(PhotoResponse::from(photo)))).into_response()
}

pub async fn add_photo_from_url(Json(payload): Json<CreatePhotoFromUrl>) -> impl IntoResponse {
    let url = &payload.url;

    if url.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<PhotoResponse>::error("URL is required")),
        )
            .into_response();
    }

    let response = match reqwest::Client::new().get(url).send().await {
        Ok(resp) => resp,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<PhotoResponse>::error(&format!("Failed to fetch URL: {}", e))),
            )
                .into_response();
        }
    };

    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("image/jpeg")
        .to_string();
    
    let bytes = match response.bytes().await {
        Ok(b) => b.to_vec(),
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<PhotoResponse>::error(&format!("Failed to read image: {}", e))),
            )
                .into_response();
        }
    };

    let ext = match content_type.as_str() {
        "image/png" => "png",
        "image/gif" => "gif",
        "image/webp" => "webp",
        _ => "jpg",
    };

    let uploads_dir = std::env::var("UPLOADS_DIR").unwrap_or_else(|_| "uploads".to_string());
    let _ = std::fs::create_dir_all(&uploads_dir);

    let unique_filename = format!("{}_{}.{}", chrono::Utc::now().timestamp(), Uuid::new_v4(), ext);
    let storage_path = std::path::Path::new(&uploads_dir).join(&unique_filename);

    if let Err(e) = std::fs::write(&storage_path, &bytes) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<PhotoResponse>::error(&format!("Failed to save file: {}", e))),
        )
            .into_response();
    }

    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            let _ = std::fs::remove_file(&storage_path);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<PhotoResponse>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let filename = unique_filename.clone();

    match conn.execute(
        "INSERT INTO photos (filename, source_url, storage_path, is_public) VALUES (?1, ?2, ?3, 1)",
        params![filename, url, unique_filename],
    ) {
        Ok(_) => {}
        Err(e) => {
            let _ = std::fs::remove_file(&storage_path);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<PhotoResponse>::error(&e.to_string())),
            )
                .into_response();
        }
    }

    let photo_id = conn.last_insert_rowid();
    let photo = Photo {
        id: photo_id,
        filename,
        source_url: Some(url.clone()),
        storage_path: unique_filename,
        is_public: true,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };

    (StatusCode::OK, Json(ApiResponse::success(PhotoResponse::from(photo)))).into_response()
}

pub async fn delete_photo(Path(id): Path<i64>) -> impl IntoResponse {
    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let storage_path: Result<String, _> = conn.query_row(
        "SELECT storage_path FROM photos WHERE id = ?1",
        params![id],
        |row| row.get(0),
    );

    let storage_path = match storage_path {
        Ok(p) => p,
        Err(_) => {
            return (
                StatusCode::NOT_FOUND,
                Json(ApiResponse::<()>::error("Photo not found")),
            )
                .into_response();
        }
    };

    let uploads_dir = std::env::var("UPLOADS_DIR").unwrap_or_else(|_| "uploads".to_string());
    let full_path = std::path::Path::new(&uploads_dir).join(&storage_path);
    let _ = std::fs::remove_file(full_path);

    match conn.execute("DELETE FROM photos WHERE id = ?1", params![id]) {
        Ok(_) => {}
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&e.to_string())),
            )
                .into_response();
        }
    }

    (StatusCode::OK, Json(ApiResponse::<()>::success(()))).into_response()
}

pub async fn update_visibility(
    Path(id): Path<i64>,
    Json(payload): Json<UpdateVisibility>,
) -> impl IntoResponse {
    let conn = match get_connection() {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    let rows_affected = match conn.execute(
        "UPDATE photos SET is_public = ?1, updated_at = datetime('now') WHERE id = ?2",
        params![if payload.is_public { 1 } else { 0 }, id],
    ) {
        Ok(r) => r,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<()>::error(&e.to_string())),
            )
                .into_response();
        }
    };

    if rows_affected == 0 {
        return (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()>::error("Photo not found")),
        )
            .into_response();
    }

    (StatusCode::OK, Json(ApiResponse::success(()))).into_response()
}
