use axum::{extract::State, routing::{get, post}, Json, Router};
use std::{env, net::SocketAddr, sync::Arc};
use tracing::{info, Level};

mod error;
mod lifi_client;
mod types;
mod uxwallet_codec;

use crate::error::ServiceError;
use crate::types::{
    BuildCalldataResponse, BuildIntentRequest, BuildIntentResponse, HealthResponse, QuoteRequest,
};

#[derive(Clone)]
struct AppState {
    http: reqwest::Client,
    lifi_api_url: String,
    lifi_api_key: Option<String>,
    origin_settler: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(Level::INFO)
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let lifi_api_url = env::var("LIFI_API_URL").unwrap_or_else(|_| "https://li.quest/v1".to_string());
    let lifi_api_key = env::var("LIFI_API_KEY").ok();
    let origin_settler = env::var("UX_ORIGIN_SETTLER").ok();
    let port: u16 = env::var("PORT").ok().and_then(|v| v.parse().ok()).unwrap_or(8080);

    let state = AppState {
        http: reqwest::Client::new(),
        lifi_api_url,
        lifi_api_key,
        origin_settler,
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/lifi/quote", post(lifi_quote))
        .route("/intent/build", post(build_intent))
        .route("/intent/calldata", post(build_calldata))
        .with_state(Arc::new(state));

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("lif-rust listening on {}", addr);

    axum::serve(tokio::net::TcpListener::bind(addr).await?, app).await?;
    Ok(())
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
    })
}

async fn lifi_quote(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<QuoteRequest>,
) -> Result<Json<serde_json::Value>, ServiceError> {
    let response = lifi_client::get_quote(
        &state.http,
        &state.lifi_api_url,
        state.lifi_api_key.as_deref(),
        &payload,
    )
    .await?;

    Ok(Json(response))
}

async fn build_intent(
    Json(payload): Json<BuildIntentRequest>,
) -> Result<Json<BuildIntentResponse>, ServiceError> {
    let response = uxwallet_codec::build_onchain_order(payload)?;
    Ok(Json(response))
}

async fn build_calldata(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<BuildIntentRequest>,
) -> Result<Json<BuildCalldataResponse>, ServiceError> {
    let origin = state.origin_settler.clone().ok_or_else(|| {
        ServiceError::BadRequest("UX_ORIGIN_SETTLER is not set".to_string())
    })?;

    let (intent, calldata) = uxwallet_codec::build_open_calldata(payload)?;

    Ok(Json(BuildCalldataResponse {
        to: origin,
        data: calldata,
        order_data_type: intent.order_data_type,
        order_data: intent.order_data,
        onchain_order: intent.onchain_order,
    }))
}
