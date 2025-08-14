import { ethers } from 'ethers';
import { IBlockchainProvider } from './IBlockchainProvider';
import { UAsset, UAssetBalance, Transaction, BlockchainType } from '../types';
import { NetworkConfig } from '../types';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export class EVMProvider implements IBlockchainProvider {
  private provider: ethers.JsonRpcProvider;
  private networkConfig: NetworkConfig;

  constructor(networkConfig: NetworkConfig) {
    this.networkConfig = networkConfig;
    this.provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
  }

  async getAssetInfo(contractAddress: string): Promise<UAsset> {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
    // I use different functions so this example still works with normal ERC20 tokens
    const [name, symbol, decimals, totalSupply, underlyingAsset, exchangeRate] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
      contract.symbol(), // TODO: Get underlying asset address from contract
      contract.decimals(), // TODO: Get exchange rate from contract
    ]);
    return {
      id: `${this.networkConfig.id}-${contractAddress}`,
      name: 'Universal ' + name,
      symbol: 'u' + symbol,
      decimals: Number(decimals),
      blockchainType: BlockchainType.EVM,
      networkId: this.networkConfig.id,
      contractAddress,
      underlyingAsset,
      exchangeRate: String(exchangeRate),
      totalSupply: totalSupply.toString(),
      circulatingSupply: totalSupply.toString(),
      lastUpdated: new Date(),
    };
  }

  async getBalance(contractAddress: string, walletAddress: string): Promise<UAssetBalance> {
    const contract = new ethers.Contract(contractAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(walletAddress);
    const assetInfo = await this.getAssetInfo(contractAddress);

    const formattedBalance = ethers.formatUnits(balance, assetInfo.decimals);

    return {
      assetId: assetInfo.id,
      walletAddress,
      balance: balance.toString(),
      formattedBalance,
      lastUpdated: new Date(),
    };
  }

  async getTransaction(hash: string): Promise<Transaction> {
    const tx = await this.provider.getTransaction(hash);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    const receipt = await this.provider.getTransactionReceipt(hash);
    const status = receipt?.status === 1 ? 'confirmed' : 'failed';

    return {
      hash,
      from: tx.from,
      to: tx.to || '',
      assetId: '',
      amount: tx.value.toString(),
      blockchainType: BlockchainType.EVM,
      networkId: this.networkConfig.id,
      status,
      blockNumber: tx.blockNumber || undefined,
      timestamp: new Date(),
    };
  }

  async estimateGas({
    from,
    to,
    amount,
  }: {
    from: string;
    to: string;
    amount: string;
  }): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        from,
        to,
        value: ethers.parseEther(amount),
      });
      return gasEstimate.toString();
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
