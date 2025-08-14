import { UAsset, UAssetBalance, Transaction } from '../types';

export interface IBlockchainProvider {
  getAssetInfo(contractAddress: string): Promise<UAsset>;
  getBalance(contractAddress: string, walletAddress: string): Promise<UAssetBalance>;
  getTransaction(hash: string): Promise<Transaction>;
  estimateGas(params: { from: string; to: string; amount: string }): Promise<string>;
}
