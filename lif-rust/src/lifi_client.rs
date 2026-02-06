use crate::error::ServiceError;
use crate::types::QuoteRequest;
use reqwest::Client;
use serde_json::Value;

pub async fn get_quote(client: &Client, api_url: &str, api_key: Option<&str>, params: &QuoteRequest) -> Result<Value, ServiceError> {
    let url = format!("{}/quote", api_url.trim_end_matches('/'));
    let mut req = client.get(url).query(params);

    if let Some(key) = api_key {
        req = req.header("x-lifi-api-key", key);
    }

    let resp = req.send().await?;
    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_else(|_| "".to_string());
        return Err(ServiceError::Upstream(format!("LI.FI status {}: {}", status, body)));
    }

    Ok(resp.json::<Value>().await?)
}
