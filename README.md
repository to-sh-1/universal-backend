# uAsset Backend

A Node.js backend service for handling uAsset coins across multiple blockchain networks including EVM-compatible chains (Ethereum, Base, Polygon) and Solana.


The endpoints are testable with ERC-20 Contract Addresses. I hard coded some logic to show what this would look like if you were calling our custom contract

## Features

- **Multi-Chain Support**: EVM (Ethereum, Base, Polygon, Arbitrum, Optimism) and Solana
- **TypeScript**: Full TypeScript support with strict typing
- **Clean Architecture**: Provider pattern for blockchain abstraction
- **RESTful API**: Comprehensive API endpoints for uAsset operations
- **Validation**: Input validation using Joi
- **Logging**: Winston-based logging system
- **Security**: Helmet.js security headers and CORS support

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd uasset-backend
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment file and configure:

```bash
cp env.example .env
```

4. Update `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
BASE_RPC_URL=https://mainnet.base.org
POLYGON_RPC_URL=https://polygon-rpc.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

## API Endpoints

### Networks

- `GET /api/v1/uasset/networks` - Get all supported networks

### Assets
These are testable with ERC-20 Tokens.  I hard coded some logic to show how this would work with a uAsset contract
- `GET /api/v1/uasset/:networkId/asset/:contractAddress` - Get asset information
- `GET /api/v1/uasset/:networkId/balance/:contractAddress/:walletAddress` - Get wallet balance

### Transactions

- `GET /api/v1/uasset/:networkId/transaction/:hash` - Get transaction details
- `GET /api/v1/uasset/:networkId/transactions/:walletAddress` - Get transaction history
- `POST /api/v1/uasset/:networkId/estimate-gas` - Estimate gas for transaction

### Health

- `GET /health` - Health check endpoint

## Architecture

```
src/
├── types/           # TypeScript interfaces and types
├── providers/       # Blockchain provider implementations
├── managers/        # Business logic managers
├── services/        # Service layer
├── routes/          # API route handlers
└── index.ts         # Main application entry point
```

### Provider Pattern

The system uses a provider pattern to abstract blockchain interactions:

- `IBlockchainProvider` - Interface for blockchain operations
- `EVMProvider` - Implementation for EVM-compatible chains
- `SolanaProvider` - Implementation for Solana

### Network Management

`BlockchainManager` handles multiple networks and their providers, making it easy to add new chains.

## Adding New Networks

To add a new EVM network:

```typescript
const newNetwork: NetworkConfig = {
  id: 'new-chain',
  name: 'New Chain',
  rpcUrl: 'https://rpc.newchain.com',
  chainId: 1234,
  blockExplorer: 'https://explorer.newchain.com',
};

blockchainManager.addNetwork(newNetwork);
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Logging

The application uses Winston for logging with:

- File-based logging (`combined.log`, `error.log`)
- Console logging in development
- Structured JSON logging

## Security

- Helmet.js security headers
- CORS configuration
- Input validation and sanitization
- Rate limiting (can be added)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Production Deployment

1. Build the application:

```bash
npm run build
```

2. Set environment variables:

```bash
NODE_ENV=production
PORT=3000
# ... other required env vars
```

3. Start the server:

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License
