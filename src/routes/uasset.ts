import { Router, Request, Response } from 'express';
import { UAssetService } from '../services/UAssetService';
import { validateAddressByNetwork, validateHashByNetwork } from '../utils/validation';

const router = Router();

router.get('/networks', async (req: Request, res: Response) => {
  try {
    const uAssetService = req.app.locals.uAssetService as UAssetService;
    const result = await uAssetService.getNetworks();

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
});

router.get('/:networkId/asset/:contractAddress', async (req: Request, res: Response) => {
  try {
    const { networkId, contractAddress } = req.params;

    if (!validateAddressByNetwork(contractAddress, networkId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid contract address for network: ${networkId}`,
        timestamp: new Date(),
      });
    }

    const uAssetService = req.app.locals.uAssetService as UAssetService;
    const result = await uAssetService.getAssetInfo(networkId, contractAddress);
    if (result.success) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
});

router.get(
  '/:networkId/balance/:contractAddress/:walletAddress',
  async (req: Request, res: Response) => {
    try {
      const { networkId, contractAddress, walletAddress } = req.params;

      if (!validateAddressByNetwork(contractAddress, networkId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid contract address for network: ${networkId}`,
          timestamp: new Date(),
        });
      }

      if (!validateAddressByNetwork(walletAddress, networkId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid wallet address for network: ${networkId}`,
          timestamp: new Date(),
        });
      }

      const uAssetService = req.app.locals.uAssetService as UAssetService;
      const result = await uAssetService.getBalance(networkId, contractAddress, walletAddress);

      if (result.success) {
        return res.json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date(),
      });
    }
  }
);

router.get('/:networkId/transaction/:hash', async (req: Request, res: Response) => {
  try {
    const { networkId, hash } = req.params;

    if (!validateHashByNetwork(hash, networkId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid transaction hash for network: ${networkId}`,
        timestamp: new Date(),
      });
    }

    const uAssetService = req.app.locals.uAssetService as UAssetService;
    const result = await uAssetService.getTransaction(networkId, hash);

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
});

router.post('/:networkId/estimate-gas', async (req: Request, res: Response) => {
  try {
    const { networkId } = req.params;
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: from, to, amount',
        timestamp: new Date(),
      });
    }

    if (!validateAddressByNetwork(from, networkId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid 'from' address for network: ${networkId}`,
        timestamp: new Date(),
      });
    }

    if (!validateAddressByNetwork(to, networkId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid 'to' address for network: ${networkId}`,
        timestamp: new Date(),
      });
    }

    const uAssetService = req.app.locals.uAssetService as UAssetService;
    const result = await uAssetService.estimateGas(networkId, from, to, amount);

    if (result.success) {
      return res.json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date(),
    });
  }
});

export default router;
