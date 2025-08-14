import { BlockchainManager } from '../managers/BlockchainManager';
import { UAsset, UAssetBalance, Transaction, APIResponse } from '../types';

export class UAssetService {
  private blockchainManager: BlockchainManager;

  constructor(blockchainManager: BlockchainManager) {
    this.blockchainManager = blockchainManager;
  }

  async getAssetInfo(networkId: string, contractAddress: string): Promise<APIResponse<UAsset>> {
    try {
      const provider = this.blockchainManager.getProvider(networkId);
      const asset = await provider.getAssetInfo(contractAddress);

      // Convert BigInt values to strings
      const assetWithStringValues = {
        ...asset,
        totalSupply: asset.totalSupply.toString(),
        circulatingSupply: asset.circulatingSupply.toString(),
      };

      return {
        success: true,
        data: assetWithStringValues,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getBalance(
    networkId: string,
    contractAddress: string,
    walletAddress: string
  ): Promise<APIResponse<UAssetBalance>> {
    try {
      const provider = this.blockchainManager.getProvider(networkId);
      const balance = await provider.getBalance(contractAddress, walletAddress);
      return {
        success: true,
        data: balance,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getTransaction(networkId: string, hash: string): Promise<APIResponse<Transaction>> {
    try {
      const provider = this.blockchainManager.getProvider(networkId);
      const transaction = await provider.getTransaction(hash);

      return {
        success: true,
        data: transaction,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async estimateGas(
    networkId: string,
    from: string,
    to: string,
    amount: string
  ): Promise<APIResponse<string>> {
    try {
      const provider = this.blockchainManager.getProvider(networkId);
      const gasEstimate = await provider.estimateGas({ from, to, amount });
      return {
        success: true,
        data: gasEstimate,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  async getNetworks(): Promise<APIResponse<any[]>> {
    try {
      const networks = this.blockchainManager.getAllNetworks();

      return {
        success: true,
        data: networks,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }
}
