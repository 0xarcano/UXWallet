import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode, isAppError } from '../../../src/lib/errors.js';

describe('AppError', () => {
  it('creates with correct code and default status', () => {
    const err = new AppError(ErrorCode.VALIDATION_ERROR, 'bad input');
    expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad input');
    expect(err.name).toBe('AppError');
  });

  it('allows a custom statusCode override', () => {
    const err = new AppError(ErrorCode.INTERNAL_ERROR, 'custom', 503);
    expect(err.statusCode).toBe(503);
  });

  it('serialises to JSON correctly', () => {
    const err = new AppError(ErrorCode.NOT_FOUND, 'gone', undefined, {
      id: '123',
    });
    const json = err.toJSON();
    expect(json).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'gone',
        details: { id: '123' },
      },
    });
  });

  it('omits details when undefined', () => {
    const json = new AppError(ErrorCode.TIMEOUT, 'slow').toJSON();
    expect(json.error).not.toHaveProperty('details');
  });

  describe('factory methods', () => {
    it('validation → 400', () => {
      const err = AppError.validation('nope');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('notFound → 404', () => {
      expect(AppError.notFound('x').statusCode).toBe(404);
    });

    it('unauthorized → 401', () => {
      expect(AppError.unauthorized('x').statusCode).toBe(401);
    });

    it('internal → 500', () => {
      expect(AppError.internal('x').statusCode).toBe(500);
    });

    it('timeout → 504', () => {
      expect(AppError.timeout('x').statusCode).toBe(504);
    });

    it('insufficientFunds → 400', () => {
      expect(AppError.insufficientFunds('x').statusCode).toBe(400);
    });

    it('insufficientLiquidity → 503', () => {
      expect(AppError.insufficientLiquidity('x').statusCode).toBe(503);
    });
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError(ErrorCode.INTERNAL_ERROR, 'x'))).toBe(true);
  });

  it('returns false for plain Error', () => {
    expect(isAppError(new Error('x'))).toBe(false);
  });

  it('returns false for non-errors', () => {
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
  });
});
