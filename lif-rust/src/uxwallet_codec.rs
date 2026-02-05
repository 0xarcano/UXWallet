use crate::error::ServiceError;
use crate::types::{BuildIntentRequest, BuildIntentResponse, OnchainCrossChainOrderPayload};
use alloy_primitives::{keccak256, Address, B256, Bytes, U256};
use alloy_sol_types::{sol, SolValue};


sol! {
    struct Output {
        bytes32 token;
        uint256 amount;
        bytes32 recipient;
        uint256 chainId;
    }

    struct UXDepositOrder {
        address user;
        address inputToken;
        uint256 inputAmount;
        Output[] outputs;
        bytes32 destinationSettler;
        bytes[] destinationCallData;
        uint256 nonce;
        bytes lifiCalldata;
    }

    struct OnchainCrossChainOrder {
        uint32 fillDeadline;
        bytes32 orderDataType;
        bytes orderData;
    }
}

pub fn build_onchain_order(payload: BuildIntentRequest) -> Result<BuildIntentResponse, ServiceError> {
    let order_data_type = payload
        .order_data_type
        .unwrap_or_else(|| "UXDepositOrder".to_string());

    let user = parse_address(&payload.order_data.user)?;
    let input_token = parse_address(&payload.order_data.input_token)?;
    let input_amount = parse_u256(&payload.order_data.input_amount)?;

    if payload.order_data.outputs.is_empty() {
        return Err(ServiceError::BadRequest("outputs must not be empty".to_string()));
    }
    if payload.order_data.outputs.len() != payload.order_data.destination_call_data.len() {
        return Err(ServiceError::BadRequest(
            "destinationCallData length must match outputs length".to_string(),
        ));
    }

    let mut outputs = Vec::with_capacity(payload.order_data.outputs.len());
    for output in payload.order_data.outputs {
        let token = parse_b256_or_address(&output.token)?;
        let recipient = parse_b256_or_address(&output.recipient)?;
        let amount = parse_u256(&output.amount)?;
        outputs.push(Output {
            token,
            amount,
            recipient,
            chainId: U256::from(output.chain_id),
        });
    }

    let destination_settler = parse_b256_or_address(&payload.order_data.destination_settler)?;
    let mut destination_call_data = Vec::with_capacity(payload.order_data.destination_call_data.len());
    for data in payload.order_data.destination_call_data {
        destination_call_data.push(parse_bytes(&data)?);
    }

    let lifi_calldata = parse_bytes(&payload.order_data.lifi_calldata)?;

    let ux_order = UXDepositOrder {
        user,
        inputToken: input_token,
        inputAmount: input_amount,
        outputs,
        destinationSettler: destination_settler,
        destinationCallData: destination_call_data,
        nonce: U256::from(payload.order_data.nonce),
        lifiCalldata: lifi_calldata,
    };

    let order_data = ux_order.abi_encode();

    let order_data_type_hash = resolve_order_data_type(&order_data_type)?;

    let onchain = OnchainCrossChainOrder {
        fillDeadline: payload.fill_deadline,
        orderDataType: order_data_type_hash,
        orderData: order_data.clone().into(),
    };

    let onchain_encoded = onchain.abi_encode();

    Ok(BuildIntentResponse {
        order_data_type: format!("0x{}", hex::encode(order_data_type_hash)),
        order_data: format!("0x{}", hex::encode(order_data)),
        onchain_order: OnchainCrossChainOrderPayload {
            fill_deadline: payload.fill_deadline,
            order_data_type: format!("0x{}", hex::encode(order_data_type_hash)),
            order_data: format!("0x{}", hex::encode(onchain_encoded)),
        },
    })
}

fn parse_address(value: &str) -> Result<Address, ServiceError> {
    value
        .parse()
        .map_err(|_| ServiceError::BadRequest(format!("invalid address: {}", value)))
}

fn parse_b256_or_address(value: &str) -> Result<B256, ServiceError> {
    if is_address(value) {
        let address: Address = parse_address(value)?;
        let mut padded = [0u8; 32];
        padded[12..].copy_from_slice(address.as_slice());
        return Ok(B256::from(padded));
    }

    value
        .parse()
        .map_err(|_| ServiceError::BadRequest(format!("invalid bytes32: {}", value)))
}

fn parse_u256(value: &str) -> Result<U256, ServiceError> {
    if let Some(hex) = value.strip_prefix("0x") {
        return U256::from_str_radix(hex, 16)
            .map_err(|_| ServiceError::BadRequest(format!("invalid uint256: {}", value)));
    }

    U256::from_str_radix(value, 10)
        .map_err(|_| ServiceError::BadRequest(format!("invalid uint256: {}", value)))
}

fn parse_bytes(value: &str) -> Result<Bytes, ServiceError> {
    let value = value.strip_prefix("0x").unwrap_or(value);
    let decoded = hex::decode(value).map_err(|_| ServiceError::BadRequest(format!("invalid bytes: {}", value)))?;
    Ok(Bytes::from(decoded))
}

fn is_address(value: &str) -> bool {
    let value = value.strip_prefix("0x").unwrap_or(value);
    value.len() == 40
}

fn is_hex_bytes32(value: &str) -> bool {
    let value = value.strip_prefix("0x").unwrap_or(value);
    value.len() == 64
}

fn resolve_order_data_type(value: &str) -> Result<B256, ServiceError> {
    if is_hex_bytes32(value) {
        return value
            .parse()
            .map_err(|_| ServiceError::BadRequest(format!("invalid orderDataType: {}", value)));
    }

    Ok(keccak256(value.as_bytes()))
}
