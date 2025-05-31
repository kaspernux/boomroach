import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import axios from 'axios';
import { SOLANA_CONFIG } from '@/config/environment';
import { logger } from '@/utils/logger';

// Initialize Solana connection
export const connection = new Connection(SOLANA_CONFIG.rpcUrl, 'confirmed');

// Popular Solana tokens for price tracking
export const POPULAR_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  COPE: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
  STEP: 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT',
  MEDIA: 'ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs',
  TULIP: 'TuLipcqtGVXP9XR62wM8WWCm6a9vhLs7T1uoWBk6FDs',
  // Add more tokens as needed
} as const;

// Token info interface
interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Price data interface
export interface PriceData {
  mint: string;
  symbol: string;
  price: number;
  volume24h: number;
  change24h: number;
  priceUSD: number;
  marketCap?: number;
  timestamp: Date;
}

// Jupiter API service
class JupiterService {
  private baseUrl = SOLANA_CONFIG.jupiterApiUrl;

  async getPrice(tokenMint: string): Promise<PriceData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: { ids: tokenMint },
        timeout: 5000,
      });

      const priceInfo = response.data.data[tokenMint];
      if (!priceInfo) {
        return null;
      }

      return {
        mint: tokenMint,
        symbol: priceInfo.mintSymbol || 'UNKNOWN',
        price: priceInfo.price,
        volume24h: priceInfo.volume24h || 0,
        change24h: priceInfo.priceChange24h || 0,
        priceUSD: priceInfo.price,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`Failed to fetch price from Jupiter for ${tokenMint}:`, error);
      return null;
    }
  }

  async getPrices(tokenMints: string[]): Promise<PriceData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/price`, {
        params: { ids: tokenMints.join(',') },
        timeout: 10000,
      });

      const prices: PriceData[] = [];
      
      for (const [mint, priceInfo] of Object.entries(response.data.data)) {
        if (priceInfo && typeof priceInfo === 'object') {
          const price = priceInfo as any;
          prices.push({
            mint,
            symbol: price.mintSymbol || 'UNKNOWN',
            price: price.price,
            volume24h: price.volume24h || 0,
            change24h: price.priceChange24h || 0,
            priceUSD: price.price,
            timestamp: new Date(),
          });
        }
      }

      return prices;
    } catch (error) {
      logger.error('Failed to fetch prices from Jupiter:', error);
      return [];
    }
  }

  async getTokenList(): Promise<TokenInfo[]> {
    try {
      const response = await axios.get('https://token.jup.ag/all', {
        timeout: 10000,
      });

      return response.data.map((token: any) => ({
        mint: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        logoURI: token.logoURI,
      }));
    } catch (error) {
      logger.error('Failed to fetch token list from Jupiter:', error);
      return [];
    }
  }
}

// Raydium API service
class RaydiumService {
  private baseUrl = SOLANA_CONFIG.raydiumApiUrl;

  async getPoolInfo(poolId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/main/pool/${poolId}`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch pool info from Raydium for ${poolId}:`, error);
      return null;
    }
  }

  async getPools(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v2/main/pools`, {
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch pools from Raydium:', error);
      return [];
    }
  }
}

// Birdeye API service (alternative price source)
class BirdeyeService {
  private baseUrl = 'https://public-api.birdeye.so';

  async getPrice(tokenMint: string): Promise<PriceData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/public/price`, {
        params: { address: tokenMint },
        timeout: 5000,
      });

      const data = response.data.data;
      if (!data) {
        return null;
      }

      return {
        mint: tokenMint,
        symbol: 'UNKNOWN', // Birdeye doesn't always provide symbol
        price: data.value,
        volume24h: 0,
        change24h: 0,
        priceUSD: data.value,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`Failed to fetch price from Birdeye for ${tokenMint}:`, error);
      return null;
    }
  }

  async getTokenOverview(tokenMint: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/public/token_overview`, {
        params: { address: tokenMint },
        timeout: 5000,
      });

      return response.data.data;
    } catch (error) {
      logger.error(`Failed to fetch token overview from Birdeye for ${tokenMint}:`, error);
      return null;
    }
  }
}

// Wallet utilities
export class WalletService {
  static validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  static async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      logger.error(`Failed to get balance for ${address}:`, error);
      return 0;
    }
  }

  static async getTokenAccounts(address: string): Promise<any[]> {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error) {
      logger.error(`Failed to get token accounts for ${address}:`, error);
      return [];
    }
  }
}

// Main Solana service
export class SolanaService {
  private jupiter = new JupiterService();
  private raydium = new RaydiumService();
  private birdeye = new BirdeyeService();

  async getPrice(tokenMint: string): Promise<PriceData | null> {
    // Try Jupiter first, fallback to Birdeye
    let price = await this.jupiter.getPrice(tokenMint);
    
    if (!price) {
      price = await this.birdeye.getPrice(tokenMint);
    }

    return price;
  }

  async getPrices(tokenMints: string[]): Promise<PriceData[]> {
    return await this.jupiter.getPrices(tokenMints);
  }

  async getPopularTokenPrices(): Promise<PriceData[]> {
    const mints = Object.values(POPULAR_TOKENS);
    return await this.getPrices(mints);
  }

  async getTokenInfo(tokenMint: string): Promise<TokenInfo | null> {
    try {
      const tokenList = await this.jupiter.getTokenList();
      return tokenList.find(token => token.mint === tokenMint) || null;
    } catch (error) {
      logger.error(`Failed to get token info for ${tokenMint}:`, error);
      return null;
    }
  }

  async validateTransaction(signature: string): Promise<boolean> {
    try {
      const transaction = await connection.getTransaction(signature);
      return transaction !== null;
    } catch (error) {
      logger.error(`Failed to validate transaction ${signature}:`, error);
      return false;
    }
  }

  async getRecentTransactions(address: string, limit = 10): Promise<any[]> {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = await Promise.all(
        signatures.map(sig => connection.getTransaction(sig.signature))
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      logger.error(`Failed to get recent transactions for ${address}:`, error);
      return [];
    }
  }

  // Health check for all services
  async healthCheck(): Promise<{
    solana: boolean;
    jupiter: boolean;
    raydium: boolean;
    birdeye: boolean;
  }> {
    const checks = await Promise.allSettled([
      connection.getSlot(),
      this.jupiter.getPrice(POPULAR_TOKENS.SOL),
      this.raydium.getPools(),
      this.birdeye.getPrice(POPULAR_TOKENS.SOL),
    ]);

    return {
      solana: checks[0].status === 'fulfilled',
      jupiter: checks[1].status === 'fulfilled',
      raydium: checks[2].status === 'fulfilled',
      birdeye: checks[3].status === 'fulfilled',
    };
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
export { WalletService };