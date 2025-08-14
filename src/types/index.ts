export enum BlockchainType {
  EVM = 'evm',
  SOLANA = 'solana',
}

export enum EVMChain {
  ETHEREUM = 'ethereum',
  BASE = 'base',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
}

export interface NetworkConfig {
  id: string;
  name: string;
  rpcUrl: string;
  chainId?: number;
  blockExplorer?: string;
}

export interface UAsset {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  blockchainType: BlockchainType;
  networkId: string;
  contractAddress: string;
  underlyingAsset: string;
  exchangeRate: string;
  totalSupply: string;
  circulatingSupply: string;
  price?: number;
  lastUpdated: Date;
}

export interface UAssetBalance {
  assetId: string;
  walletAddress: string;
  balance: string;
  formattedBalance: string;
  lastUpdated: Date;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  assetId: string;
  amount: string;
  blockchainType: BlockchainType;
  networkId: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
