use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("bad request: {0}")]
    BadRequest(String),
    #[error("upstream error: {0}")]
    Upstream(String),
    #[error("http error: {0}")]
    Http(#[from] reqwest::Error),
}

#[derive(Debug, Serialize)]
struct ErrorBody {
    error: String,
}

impl IntoResponse for ServiceError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            ServiceError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            ServiceError::Upstream(msg) => (StatusCode::BAD_GATEWAY, msg),
            ServiceError::Http(err) => (StatusCode::BAD_GATEWAY, err.to_string()),
        };

        let body = Json(ErrorBody { error: message });
        (status, body).into_response()
    }
}
