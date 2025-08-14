import { EVMProvider } from '../providers/EVMProvider';
import { SolanaProvider } from '../providers/SolanaProvider';
import { IBlockchainProvider } from '../providers/IBlockchainProvider';
import { BlockchainType, NetworkConfig, EVMChain } from '../types';

export class BlockchainManager {
  private providers: Map<string, IBlockchainProvider> = new Map();
  private networks: Map<string, NetworkConfig> = new Map();

  constructor() {
    this.initializeNetworks();
  }

  private initializeNetworks(): void {
    const networks: NetworkConfig[] = [
      {
        id: EVMChain.ETHEREUM,
        name: 'Ethereum Mainnet',
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
        chainId: 1,
        blockExplorer: 'https://etherscan.io',
      },
      {
        id: EVMChain.BASE,
        name: 'Base',
        rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
        chainId: 8453,
        blockExplorer: 'https://basescan.org',
      },
      {
        id: EVMChain.POLYGON,
        name: 'Polygon',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
        chainId: 137,
        blockExplorer: 'https://polygonscan.com',
      },
      {
        id: 'solana',
        name: 'Solana',
        rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        blockExplorer: 'https://solscan.io',
      },
    ];

    networks.forEach(network => {
      this.networks.set(network.id, network);
      this.initializeProvider(network);
    });
  }

  private initializeProvider(network: NetworkConfig): void {
    let provider: IBlockchainProvider;

    if (network.id === 'solana') {
      provider = new SolanaProvider(network);
    } else {
      provider = new EVMProvider(network);
    }

    this.providers.set(network.id, provider);
  }

  getProvider(networkId: string): IBlockchainProvider {
    const provider = this.providers.get(networkId);
    if (!provider) {
      throw new Error(`Provider not found for network: ${networkId}`);
    }
    return provider;
  }

  getNetwork(networkId: string): NetworkConfig {
    const network = this.networks.get(networkId);
    if (!network) {
      throw new Error(`Network not found: ${networkId}`);
    }
    return network;
  }

  getAllNetworks(): NetworkConfig[] {
    return Array.from(this.networks.values());
  }

  getNetworksByType(type: BlockchainType): NetworkConfig[] {
    return Array.from(this.networks.values()).filter(network => {
      if (type === BlockchainType.SOLANA) {
        return network.id === 'solana';
      }
      return network.id !== 'solana';
    });
  }

  addNetwork(network: NetworkConfig): void {
    this.networks.set(network.id, network);
    this.initializeProvider(network);
  }

  removeNetwork(networkId: string): void {
    this.networks.delete(networkId);
    this.providers.delete(networkId);
  }
}
