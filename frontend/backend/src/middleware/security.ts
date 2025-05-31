import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { CORS_ORIGINS, RATE_LIMIT_CONFIG } from '@/config/environment';
import { logger } from '@/utils/logger';

// CORS configuration
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed origins
    if (CORS_ORIGINS.includes(origin) || CORS_ORIGINS.includes('*')) {
      return callback(null, true);
    }
    
    logger.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-User-ID',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
});

// Helmet security middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.max,
  message: RATE_LIMIT_CONFIG.message,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip;
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for ${req.user?.id || req.ip}`, {
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.originalUrl,
      method: req.method,
    });
    
    res.status(429).json(RATE_LIMIT_CONFIG.message);
  },
});

// Strict rate limiting for sensitive endpoints
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many attempts',
    message: 'Too many requests to this endpoint. Please try again later.',
  },
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  },
});

// Trading-specific rate limiting
export const tradingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 trades per minute
  message: {
    error: 'Trading rate limit exceeded',
    message: 'Too many trades submitted. Please wait before submitting more trades.',
  },
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  },
});

// WebSocket rate limiting for messages
export const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 messages per minute
  message: {
    error: 'Message rate limit exceeded',
    message: 'Too many messages sent. Please slow down.',
  },
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  },
});

// IP blacklist middleware
const blacklistedIPs = new Set<string>();

export const ipBlacklist = (req: Request, res: Response, next: NextFunction): void => {
  const clientIP = req.ip;
  
  if (blacklistedIPs.has(clientIP)) {
    logger.warn(`Blocked blacklisted IP: ${clientIP}`);
    res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked',
    });
    return;
  }
  
  next();
};

// Add IP to blacklist
export const addToBlacklist = (ip: string): void => {
  blacklistedIPs.add(ip);
  logger.info(`Added IP to blacklist: ${ip}`);
};

// Remove IP from blacklist
export const removeFromBlacklist = (ip: string): void => {
  blacklistedIPs.delete(ip);
  logger.info(`Removed IP from blacklist: ${ip}`);
};

// Request size limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && Number.parseInt(contentLength) > maxSize) {
    res.status(413).json({
      error: 'Request too large',
      message: 'Request body exceeds maximum allowed size',
    });
    return;
  }
  
  next();
};

// Anti-bot middleware (basic implementation)
export const antiBotMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent');
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];
  
  // Allow common browsers and legitimate tools
  const allowedPatterns = [
    /mozilla/i,
    /chrome/i,
    /safari/i,
    /firefox/i,
    /edge/i,
    /postman/i,
    /insomnia/i,
  ];
  
  if (userAgent) {
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const isAllowed = allowedPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious && !isAllowed) {
      logger.warn(`Suspicious user agent detected: ${userAgent}`, {
        ip: req.ip,
        endpoint: req.originalUrl,
      });
      
      res.status(403).json({
        error: 'Access denied',
        message: 'Automated requests are not allowed',
      });
      return;
    }
  }
  
  next();
};

// Request logging middleware with security focus
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log sensitive endpoint access
  const sensitiveEndpoints = ['/auth', '/admin', '/trading', '/wallet'];
  const isSensitive = sensitiveEndpoints.some(endpoint => 
    req.originalUrl.startsWith(endpoint)
  );
  
  if (isSensitive) {
    logger.info('Sensitive endpoint access', {
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error Response', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });
    }
  });
  
  next();
};

// Timeout middleware
export const timeoutMiddleware = (timeout = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.error(`Request timeout: ${req.method} ${req.originalUrl}`, {
          ip: req.ip,
          userId: req.user?.id,
          timeout,
        });
        
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process',
        });
      }
    }, timeout);
    
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};

// Content-Type validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      next();
      return;
    }
    
    const contentType = req.get('Content-Type');
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      res.status(400).json({
        error: 'Invalid content type',
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      });
      return;
    }
    
    next();
  };
};

// Combined security middleware stack
export const securityMiddleware = [
  securityHeaders,
  corsMiddleware,
  ipBlacklist,
  requestSizeLimit,
  antiBotMiddleware,
  securityLogger,
  timeoutMiddleware(),
  generalRateLimit,
];