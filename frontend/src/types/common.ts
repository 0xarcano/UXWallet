export type Uint256String = string & { readonly __brand: 'Uint256String' };
export type EthereumAddress = string & { readonly __brand: 'EthereumAddress' };

const UINT256_REGEX = /^\d+$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function toUint256String(value: string): Uint256String {
  if (!UINT256_REGEX.test(value)) {
    throw new Error('Invalid uint256 string');
  }
  return value as Uint256String;
}

export function toEthereumAddress(value: string): EthereumAddress {
  if (!ADDRESS_REGEX.test(value)) {
    throw new Error('Invalid Ethereum address');
  }
  return value.toLowerCase() as EthereumAddress;
}

export function isValidUint256String(value: string): value is Uint256String {
  return UINT256_REGEX.test(value);
}

export function isValidEthereumAddress(value: string): value is EthereumAddress {
  return ADDRESS_REGEX.test(value);
}
