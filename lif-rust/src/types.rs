use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuoteRequest {
    #[serde(rename = "fromChain")]
    pub from_chain: u64,
    #[serde(rename = "toChain")]
    pub to_chain: u64,
    #[serde(rename = "fromToken")]
    pub from_token: String,
    #[serde(rename = "toToken")]
    pub to_token: String,
    #[serde(rename = "fromAmount")]
    pub from_amount: String,
    #[serde(rename = "fromAddress", skip_serializing_if = "Option::is_none")]
    pub from_address: Option<String>,
    #[serde(rename = "toAddress", skip_serializing_if = "Option::is_none")]
    pub to_address: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub slippage: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UxOutput {
    pub token: String,
    pub amount: String,
    pub recipient: String,
    #[serde(rename = "chainId")]
    pub chain_id: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UxDepositOrder {
    pub user: String,
    #[serde(rename = "inputToken")]
    pub input_token: String,
    #[serde(rename = "inputAmount")]
    pub input_amount: String,
    pub outputs: Vec<UxOutput>,
    #[serde(rename = "destinationSettler")]
    pub destination_settler: String,
    #[serde(rename = "destinationCallData")]
    pub destination_call_data: Vec<String>,
    pub nonce: u64,
    #[serde(rename = "lifiCalldata")]
    pub lifi_calldata: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildIntentRequest {
    #[serde(rename = "fillDeadline")]
    pub fill_deadline: u32,
    #[serde(rename = "orderDataType", default)]
    pub order_data_type: Option<String>,
    #[serde(rename = "orderData")]
    pub order_data: UxDepositOrder,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OnchainCrossChainOrderPayload {
    #[serde(rename = "fillDeadline")]
    pub fill_deadline: u32,
    #[serde(rename = "orderDataType")]
    pub order_data_type: String,
    #[serde(rename = "orderData")]
    pub order_data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildIntentResponse {
    #[serde(rename = "orderDataType")]
    pub order_data_type: String,
    #[serde(rename = "orderData")]
    pub order_data: String,
    #[serde(rename = "onchainOrder")]
    pub onchain_order: OnchainCrossChainOrderPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BuildCalldataResponse {
    pub to: String,
    pub data: String,
    #[serde(rename = "orderDataType")]
    pub order_data_type: String,
    #[serde(rename = "orderData")]
    pub order_data: String,
    #[serde(rename = "onchainOrder")]
    pub onchain_order: OnchainCrossChainOrderPayload,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
}
