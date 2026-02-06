// ── Error Codes ─────────────────────────────────────────────────────────────

export enum ErrorCode {
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMITED = 'RATE_LIMITED',

  // Auth / Session
  AUTH_FAILED = 'AUTH_FAILED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_KEY_INVALID = 'SESSION_KEY_INVALID',
  SESSION_KEY_EXPIRED = 'SESSION_KEY_EXPIRED',
  SESSION_KEY_REVOKED = 'SESSION_KEY_REVOKED',

  // Funds
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',

  // State
  STALE_STATE = 'STALE_STATE',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  ALLOCATION_MISMATCH = 'ALLOCATION_MISMATCH',

  // Connection
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  TIMEOUT = 'TIMEOUT',

  // Withdrawal
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  WITHDRAWAL_PENDING = 'WITHDRAWAL_PENDING',
}

// ── Default HTTP status for each code ───────────────────────────────────────

const STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.AUTH_FAILED]: 401,
  [ErrorCode.SESSION_NOT_FOUND]: 404,
  [ErrorCode.SESSION_EXPIRED]: 410,
  [ErrorCode.SESSION_KEY_INVALID]: 400,
  [ErrorCode.SESSION_KEY_EXPIRED]: 410,
  [ErrorCode.SESSION_KEY_REVOKED]: 410,
  [ErrorCode.INSUFFICIENT_FUNDS]: 400,
  [ErrorCode.INSUFFICIENT_LIQUIDITY]: 503,
  [ErrorCode.STALE_STATE]: 409,
  [ErrorCode.INVALID_SIGNATURE]: 400,
  [ErrorCode.ALLOCATION_MISMATCH]: 400,
  [ErrorCode.CONNECTION_FAILED]: 503,
  [ErrorCode.TIMEOUT]: 504,
  [ErrorCode.WITHDRAWAL_FAILED]: 500,
  [ErrorCode.WITHDRAWAL_PENDING]: 409,
};

// ── AppError ────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(
    public readonly code: ErrorCode,
    message: string,
    statusCode?: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode ?? STATUS_MAP[code] ?? 500;
  }

  // ── Convenience factories ───────────────────────────────────────────────

  static validation(message: string, details?: Record<string, unknown>) {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  static notFound(message: string) {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }

  static unauthorized(message: string) {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static internal(message: string) {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }

  static timeout(message: string) {
    return new AppError(ErrorCode.TIMEOUT, message, 504);
  }

  static insufficientFunds(message: string) {
    return new AppError(ErrorCode.INSUFFICIENT_FUNDS, message, 400);
  }

  static insufficientLiquidity(message: string) {
    return new AppError(ErrorCode.INSUFFICIENT_LIQUIDITY, message, 503);
  }

  // ── Serialisation ───────────────────────────────────────────────────────

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
