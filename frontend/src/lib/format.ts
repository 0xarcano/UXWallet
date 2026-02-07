import type { Uint256String } from '@/types/common';

export function formatBalance(amount: Uint256String, decimals: number): string {
  if (decimals < 0 || decimals > 77) {
    throw new Error('Invalid decimals value');
  }

  const raw = BigInt(amount);

  if (raw === 0n) {
    return '0';
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;

  if (remainder === 0n) {
    return whole.toString();
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.replace(/0+$/, '');

  return `${whole}.${trimmed}`;
}

export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
