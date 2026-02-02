# Error Handling

- Use custom error types instead of `require` strings for gas efficiency.
- **Pattern:** `if (condition) revert CustomError();`
