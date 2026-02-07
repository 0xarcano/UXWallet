export interface ErrorMessage {
  title: string;
  body: string;
  action?: string;
}

const FALLBACK: ErrorMessage = {
  title: 'Something Went Wrong',
  body: 'An unexpected error occurred.',
  action: 'Try again later.',
};

const USER_MESSAGES: Record<string, ErrorMessage> = {
  INSUFFICIENT_FUNDS: {
    title: 'Insufficient Funds',
    body: 'Your balance is too low for this transaction.',
    action: 'Adjust the amount and try again.',
  },
  RATE_LIMITED: {
    title: 'Slow Down',
    body: 'Too many requests. Please wait a moment.',
  },
  SESSION_KEY_EXPIRED: {
    title: 'Delegation Expired',
    body: 'Your session key has expired.',
    action: 'Re-delegate from Settings.',
  },
  NETWORK_ERROR: {
    title: 'Connection Issue',
    body: 'Unable to reach the server. Check your internet connection.',
    action: 'Try again when connected.',
  },
  INVALID_ADDRESS: {
    title: 'Invalid Address',
    body: 'The recipient address is not valid.',
    action: 'Double-check and re-enter the address.',
  },
  CHANNEL_NOT_FOUND: {
    title: 'Channel Not Found',
    body: 'The state channel could not be found.',
    action: 'Contact support if the issue persists.',
  },
  WITHDRAWAL_FAILED: {
    title: 'Withdrawal Failed',
    body: 'Your withdrawal could not be completed.',
    action: 'Try again or contact support.',
  },
  UNKNOWN: {
    title: 'Something Went Wrong',
    body: 'An unexpected error occurred.',
    action: 'Try again later.',
  },
  VALIDATION_ERROR: {
    title: 'Invalid Input',
    body: 'Please check your input and try again.',
  },
  NOT_FOUND: {
    title: 'Not Found',
    body: 'The requested resource could not be found.',
  },
  UNAUTHORIZED: {
    title: 'Authentication Required',
    body: 'Please connect your wallet and try again.',
  },
  AUTH_FAILED: {
    title: 'Authentication Failed',
    body: 'Wallet verification failed. Please try again.',
  },
  SESSION_NOT_FOUND: {
    title: 'Session Not Found',
    body: 'Your session could not be found.',
  },
  SESSION_EXPIRED: {
    title: 'Session Expired',
    body: 'Your session has expired. Please reconnect.',
  },
  SESSION_KEY_INVALID: {
    title: 'Invalid Session Key',
    body: 'Your session key is invalid or malformed.',
  },
  SESSION_KEY_REVOKED: {
    title: 'Delegation Revoked',
    body: 'Your delegation was revoked. Re-delegate from Settings.',
  },
  INSUFFICIENT_LIQUIDITY: {
    title: 'Pool Temporarily Low',
    body: 'The liquidity pool is temporarily low. Try again shortly.',
  },
  STALE_STATE: {
    title: 'State Conflict',
    body: 'A state conflict occurred. Please refresh and try again.',
  },
  INVALID_SIGNATURE: {
    title: 'Invalid Signature',
    body: 'Signature verification failed. Please try signing again.',
  },
  ALLOCATION_MISMATCH: {
    title: 'Allocation Error',
    body: 'A state channel allocation inconsistency was detected.',
  },
  WITHDRAWAL_PENDING: {
    title: 'Withdrawal In Progress',
    body: 'A withdrawal is already in progress. Please wait for it to complete.',
  },
  INTERNAL_ERROR: {
    title: 'Server Error',
    body: 'An unexpected server error occurred.',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    body: 'The request timed out. Please try again.',
  },
  CONNECTION_FAILED: {
    title: 'Connection Failed',
    body: 'Unable to reach the server. Check your connection.',
  },
};

export function getErrorMessage(code?: string): ErrorMessage {
  if (!code) {
    return FALLBACK;
  }
  return USER_MESSAGES[code] ?? FALLBACK;
}
