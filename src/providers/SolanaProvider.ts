import { Connection, PublicKey } from '@solana/web3.js';
import { IBlockchainProvider } from './IBlockchainProvider';
import { UAsset, UAssetBalance, Transaction, BlockchainType } from '../types';
import { NetworkConfig } from '../types';

// Will need a custom contract to get the asset info
// This file is more of an example of how a Solana adapter would look like
export class SolanaProvider implements IBlockchainProvider {
  private connection: Connection;
  private networkConfig: NetworkConfig;

  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig;
    this.connection = new Connection(networkConfig.rpcUrl);
  }

  async getAssetInfo(contractAddress: string): Promise<UAsset> {
    const mintPubkey = new PublicKey(contractAddress);

    try {
      const mintInfo = await this.connection.getParsedAccountInfo(mintPubkey);
      if (!mintInfo.value) {
        throw new Error('Token mint not found');
      }

      const parsedData = mintInfo.value.data as any;
      const decimals = parsedData.parsed.info.decimals;
      const supply = parsedData.parsed.info.supply;
      const underlyingAsset = parsedData.parsed.info.underlyingAsset;
      const exchangeRate = parsedData.parsed.info.exchangeRate;

      return {
        id: `${this.networkConfig.id}-${contractAddress}`,
        name: 'Solana Token',
        symbol: 'SOL',
        decimals,
        blockchainType: BlockchainType.SOLANA,
        networkId: this.networkConfig.id,
        contractAddress,
        underlyingAsset,
        exchangeRate,
        totalSupply: supply.toString(),
        circulatingSupply: supply.toString(),
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to get Solana token info: ${error}`);
    }
  }

  async getBalance(contractAddress: string, walletAddress: string): Promise<UAssetBalance> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(contractAddress);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(walletPubkey, {
        mint: mintPubkey,
      });

      let balance = '0';
      if (tokenAccounts.value.length > 0) {
        balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;
      }

      const assetInfo = await this.getAssetInfo(contractAddress);
      const formattedBalance = (Number(balance) / Math.pow(10, assetInfo.decimals)).toString();

      return {
        assetId: assetInfo.id,
        walletAddress,
        balance: balance.toString(),
        formattedBalance,
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to get Solana balance: ${error}`);
    }
  }

  async getTransaction(hash: string): Promise<Transaction> {
    try {
      const signature = hash;
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });

      if (!tx) {
        throw new Error('Transaction not found');
      }

      const status = tx.meta?.err ? 'failed' : 'confirmed';

      return {
        hash: signature,
        from: tx.transaction.message.accountKeys[0].toString(),
        to: tx.transaction.message.accountKeys[1]?.toString() || '',
        assetId: '',
        amount: '0',
        blockchainType: BlockchainType.SOLANA,
        networkId: this.networkConfig.id,
        status,
        blockNumber: tx.slot,
        timestamp: new Date(tx.blockTime! * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to get Solana transaction: ${error}`);
    }
  }

  async estimateGas(): Promise<string> {
    try {
      const { feeCalculator } = await this.connection.getRecentBlockhash(); // TODO: Get fee in non-deprecated way
      return feeCalculator.lamportsPerSignature.toString();
    } catch (error) {
      throw new Error(`Failed to estimate Solana gas: ${error}`);
    }
  }
}
