/**
 * Unit tests for validation utilities.
 */
import { describe, it, expect } from "vitest";
import {
  validateAddress,
  validateChainId,
  validatePositiveAmount,
  validateHexString,
} from "../../../src/utils/validation.js";

describe("validateAddress", () => {
  it("accepts a valid checksummed address", () => {
    const addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    expect(validateAddress(addr)).toBe(addr);
  });

  it("accepts a valid lowercase address", () => {
    const addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
    expect(validateAddress(addr)).toBe(addr);
  });

  it("rejects an invalid address", () => {
    expect(() => validateAddress("0xinvalid")).toThrow("Invalid Ethereum address");
  });

  it("rejects an empty string", () => {
    expect(() => validateAddress("")).toThrow("Invalid Ethereum address");
  });

  it("includes the field name in error message", () => {
    expect(() => validateAddress("bad", "sender")).toThrow("sender");
  });
});

describe("validateChainId", () => {
  it("accepts a valid chain ID", () => {
    expect(validateChainId(1)).toBe(1);
    expect(validateChainId(8453)).toBe(8453);
  });

  it("rejects zero", () => {
    expect(() => validateChainId(0)).toThrow("Invalid chain ID");
  });

  it("rejects negative numbers", () => {
    expect(() => validateChainId(-1)).toThrow("Invalid chain ID");
  });

  it("rejects non-integers", () => {
    expect(() => validateChainId(1.5)).toThrow("Invalid chain ID");
  });
});

describe("validatePositiveAmount", () => {
  it("accepts a valid positive amount", () => {
    expect(validatePositiveAmount("1000000000000000000")).toBe(1000000000000000000n);
  });

  it("rejects zero", () => {
    expect(() => validatePositiveAmount("0")).toThrow("Invalid positive amount");
  });

  it("rejects negative amounts", () => {
    expect(() => validatePositiveAmount("-1")).toThrow("Invalid positive amount");
  });

  it("rejects non-numeric strings", () => {
    expect(() => validatePositiveAmount("abc")).toThrow("Invalid positive amount");
  });
});

describe("validateHexString", () => {
  it("accepts a valid hex string", () => {
    expect(validateHexString("0xabcdef")).toBe("0xabcdef");
  });

  it("rejects strings without 0x prefix", () => {
    expect(() => validateHexString("abcdef")).toThrow("Invalid hex string");
  });

  it("rejects strings with invalid characters", () => {
    expect(() => validateHexString("0xghi")).toThrow("Invalid hex string");
  });
});
