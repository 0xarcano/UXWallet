/**
 * Unit tests for domain error classes.
 */
import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from "../../../src/lib/errors.js";

describe("Error classes", () => {
  it("AppError has correct defaults", () => {
    const err = new AppError("test");
    expect(err.message).toBe("test");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
  });

  it("ValidationError is 400", () => {
    const err = new ValidationError("bad input");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("AuthenticationError is 401", () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("AUTHENTICATION_ERROR");
  });

  it("AuthorizationError is 403", () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("AUTHORIZATION_ERROR");
  });

  it("NotFoundError is 404", () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });

  it("ConflictError is 409", () => {
    const err = new ConflictError();
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("CONFLICT");
  });

  it("RateLimitError is 429", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
