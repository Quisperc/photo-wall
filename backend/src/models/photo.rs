use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Photo {
    pub id: i64,
    pub filename: String,
    pub source_url: Option<String>,
    pub storage_path: String,
    pub is_public: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PhotoResponse {
    pub id: i64,
    pub filename: String,
    pub url: String,
    pub source_url: Option<String>,
    pub is_public: bool,
    pub created_at: String,
}

impl From<Photo> for PhotoResponse {
    fn from(photo: Photo) -> Self {
        PhotoResponse {
            id: photo.id,
            filename: photo.filename,
            url: if photo.source_url.is_some() {
                photo.source_url.clone().unwrap()
            } else {
                format!("/uploads/{}", photo.storage_path)
            },
            source_url: photo.source_url,
            is_public: photo.is_public,
            created_at: photo.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreatePhotoFromUrl {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVisibility {
    pub is_public: bool,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        ApiResponse {
            success: true,
            data: Some(data),
            message: None,
        }
    }

    pub fn error(message: &str) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            data: None,
            message: Some(message.to_string()),
        }
    }
}
