import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';

export const validateEVMAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

export const validateSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const validateAddressByNetwork = (address: string, networkId: string): boolean => {
  if (networkId === 'solana') {
    return validateSolanaAddress(address);
  }
  // All other networks are EVM-compatible
  return validateEVMAddress(address);
};

export const validateHashByNetwork = (hash: string, networkId: string): boolean => {
  if (networkId === 'solana') {
    // Solana uses base58 encoded signatures
    try {
      new PublicKey(hash);
      return true;
    } catch {
      return false;
    }
  }
  // EVM networks use 0x-prefixed hex hashes
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};
