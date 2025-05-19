import { ethers } from "ethers";

export function to18Decimals(amount: number | string): bigint {
  return ethers.parseUnits(amount.toString(), 18);
}

export function to6Decimals(amount: number | string): bigint {
  return ethers.parseUnits(amount.toString(), 6);
}