interface ErrorMessage {
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
};

export function getErrorMessage(code?: string): ErrorMessage {
  if (!code) {
    return FALLBACK;
  }
  return USER_MESSAGES[code] ?? FALLBACK;
}
