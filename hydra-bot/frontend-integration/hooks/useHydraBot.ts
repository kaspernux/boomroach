import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { io, Socket } from 'socket.io-client';

// Types
interface TradingSignal {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  action: 'STRONG_BUY' | 'BUY' | 'WEAK_BUY' | 'HOLD' | 'WEAK_SELL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  timestamp: string;
}

interface Portfolio {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
  positions: Position[];
}

interface Position {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
}

interface Trade {
  id: string;
  type: 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'SNIPER' | 'REENTRY';
  side: 'BUY' | 'SELL';
  tokenSymbol: string;
  amount: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
  timestamp: string;
}

interface RiskAlert {
  id: string;
  type: 'RISK_LIMIT' | 'PRICE_ALERT' | 'POSITION_ALERT' | 'SYSTEM_ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: string;
}

interface HydraBotConfig {
  sniperEnabled: boolean;
  reentryEnabled: boolean;
  aiSignalsEnabled: boolean;
  guardianEnabled: boolean;
  maxPositionSize: number;
  stopLossPercent: number;
  autoTrading: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_HYDRA_BACKEND_URL || 'http://localhost:3001';

export const useHydraBot = () => {
  // Wallet connection
  const { publicKey, signMessage, connected } = useWallet();
  
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  const [config, setConfig] = useState<HydraBotConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket connection
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Authentication token
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Initialize authentication
  useEffect(() => {
    const token = localStorage.getItem('hydra_auth_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);
  
  // WebSocket connection management
  useEffect(() => {
    if (isAuthenticated && authToken && !socketRef.current) {
      connectWebSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, authToken]);
  
  const connectWebSocket = useCallback(() => {
    if (!authToken) return;
    
    socketRef.current = io(BACKEND_URL, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling']
    });
    
    const socket = socketRef.current;
    
    socket.on('connect', () => {
      console.log('🔗 Connected to Hydra Bot backend');
      setIsConnected(true);
      setError(null);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Hydra Bot backend');
      setIsConnected(false);
    });
    
    // Listen for trading signals
    socket.on('new_signal', (signal: TradingSignal) => {
      console.log('🎯 New trading signal:', signal);
      setSignals(prev => [signal, ...prev.slice(0, 19)]); // Keep last 20
    });
    
    // Listen for portfolio updates
    socket.on('portfolio_update', (portfolioData: Portfolio) => {
      console.log('📊 Portfolio update:', portfolioData);
      setPortfolio(portfolioData);
    });
    
    // Listen for trade executions
    socket.on('trade_executed', (trade: Trade) => {
      console.log('⚡ Trade executed:', trade);
      setRecentTrades(prev => [trade, ...prev.slice(0, 9)]); // Keep last 10
    });
    
    // Listen for risk alerts
    socket.on('risk_alert', (alert: RiskAlert) => {
      console.log('⚠️ Risk alert:', alert);
      setRiskAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5
    });
    
    // Listen for price updates
    socket.on('price_update', (priceData: any) => {
      // Update portfolio with new prices
      if (portfolio) {
        setPortfolio(prev => ({
          ...prev!,
          positions: prev!.positions.map(pos => 
            pos.tokenMint === priceData.mint 
              ? { ...pos, currentPrice: priceData.price }
              : pos
          )
        }));
      }
    });
    
    socket.on('error', (error: any) => {
      console.error('❌ WebSocket error:', error);
      setError('Connection error occurred');
    });
    
  }, [authToken, portfolio]);
  
  // API request helper
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }, [authToken]);
  
  // Authentication with Solana wallet
  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage || !connected) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get challenge message from backend
      const { message: challengeMessage } = await fetch(`${BACKEND_URL}/api/auth/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toString() })
      }).then(res => res.json());
      
      // Sign the challenge
      const signature = await signMessage(new TextEncoder().encode(challengeMessage));
      
      // Verify signature and get token
      const { token, user } = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          signature: Array.from(signature),
          message: challengeMessage
        })
      }).then(res => res.json());
      
      // Store token and set authenticated
      localStorage.setItem('hydra_auth_token', token);
      setAuthToken(token);
      setIsAuthenticated(true);
      
      console.log('✅ Authenticated with Hydra Bot');
      
      // Load initial data
      await loadPortfolio();
      await loadSignals();
      await loadConfig();
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, connected]);
  
  // Load portfolio data
  const loadPortfolio = useCallback(async () => {
    try {
      const data = await apiRequest('/portfolio');
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  }, [apiRequest]);
  
  // Load trading signals
  const loadSignals = useCallback(async () => {
    try {
      const data = await apiRequest('/signals?limit=20');
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Failed to load signals:', error);
    }
  }, [apiRequest]);
  
  // Load bot configuration
  const loadConfig = useCallback(async () => {
    try {
      const data = await apiRequest('/users/config');
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }, [apiRequest]);
  
  // Execute a trading signal
  const executeSignal = useCallback(async (signalId: string, amount: number) => {
    setLoading(true);
    try {
      const result = await apiRequest('/trading/execute-signal', {
        method: 'POST',
        body: JSON.stringify({ signalId, amount })
      });
      
      console.log('✅ Signal executed:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to execute signal:', error);
      setError(error instanceof Error ? error.message : 'Failed to execute signal');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);
  
  // Place a manual trade
  const placeTrade = useCallback(async (tradeData: {
    tokenMint: string;
    side: 'BUY' | 'SELL';
    amount: number;
    type?: 'MARKET' | 'LIMIT';
    price?: number;
  }) => {
    setLoading(true);
    try {
      const result = await apiRequest('/trading/place-trade', {
        method: 'POST',
        body: JSON.stringify(tradeData)
      });
      
      console.log('✅ Trade placed:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to place trade:', error);
      setError(error instanceof Error ? error.message : 'Failed to place trade');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);
  
  // Update bot configuration
  const updateConfig = useCallback(async (newConfig: Partial<HydraBotConfig>) => {
    setLoading(true);
    try {
      const result = await apiRequest('/users/config', {
        method: 'PATCH',
        body: JSON.stringify(newConfig)
      });
      
      setConfig(prev => ({ ...prev!, ...newConfig }));
      console.log('✅ Config updated:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update config:', error);
      setError(error instanceof Error ? error.message : 'Failed to update config');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);
  
  // Dismiss risk alert
  const dismissAlert = useCallback((alertId: string) => {
    setRiskAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('hydra_auth_token');
    setAuthToken(null);
    setIsAuthenticated(false);
    setPortfolio(null);
    setSignals([]);
    setRecentTrades([]);
    setRiskAlerts([]);
    setConfig(null);
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);
  
  return {
    // State
    isAuthenticated,
    portfolio,
    signals,
    recentTrades,
    riskAlerts,
    config,
    loading,
    error,
    isConnected,
    
    // Actions
    authenticate,
    executeSignal,
    placeTrade,
    updateConfig,
    dismissAlert,
    clearError,
    logout,
    
    // Data loading
    loadPortfolio,
    loadSignals,
    loadConfig,
  };
};