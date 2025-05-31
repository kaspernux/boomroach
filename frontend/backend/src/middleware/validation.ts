import type { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '@/utils/logger';

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.debug('Validation errors:', errors.array());
    
    res.status(400).json({
      error: 'Validation failed',
      message: 'Request validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
      })),
    });
    return;
  }
  
  next();
};

// Common validation rules
export const validations = {
  // User validations
  walletAddress: body('walletAddress')
    .isString()
    .isLength({ min: 32, max: 44 })
    .withMessage('Invalid Solana wallet address'),
    
  email: body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
    
  username: body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores'),
    
  displayName: body('displayName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Display name must be 1-50 characters'),
    
  bio: body('bio')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must not exceed 500 characters'),

  // Trading validations
  tokenMint: body('tokenMint')
    .isString()
    .isLength({ min: 32, max: 44 })
    .withMessage('Invalid token mint address'),
    
  amount: body('amount')
    .isNumeric()
    .custom((value) => {
      const num = Number.parseFloat(value);
      if (num <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (num > 1e18) {
        throw new Error('Amount is too large');
      }
      return true;
    }),
    
  price: body('price')
    .isNumeric()
    .custom((value) => {
      const num = Number.parseFloat(value);
      if (num <= 0) {
        throw new Error('Price must be greater than 0');
      }
      return true;
    }),
    
  tradeType: body('type')
    .isIn(['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'])
    .withMessage('Invalid trade type'),
    
  tradeSide: body('side')
    .isIn(['BUY', 'SELL'])
    .withMessage('Invalid trade side'),

  // Guild validations
  guildName: body('name')
    .isString()
    .isLength({ min: 3, max: 50 })
    .trim()
    .matches(/^[a-zA-Z0-9\s_-]+$/)
    .withMessage('Guild name must be 3-50 characters and contain only letters, numbers, spaces, hyphens, and underscores'),
    
  guildDescription: body('description')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Guild description must not exceed 1000 characters'),

  // Message validations
  messageContent: body('content')
    .isString()
    .isLength({ min: 1, max: 2000 })
    .trim()
    .withMessage('Message content must be 1-2000 characters'),
    
  messageType: body('type')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'TRADE_ALERT', 'SYSTEM'])
    .withMessage('Invalid message type'),

  // Pagination validations
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Page must be a positive integer'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
    
  sortBy: query('sortBy')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Invalid sort field'),
    
  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  // ID validations
  userId: param('userId')
    .isString()
    .isLength({ min: 20, max: 30 })
    .withMessage('Invalid user ID'),
    
  guildId: param('guildId')
    .isString()
    .isLength({ min: 20, max: 30 })
    .withMessage('Invalid guild ID'),
    
  tradeId: param('tradeId')
    .isString()
    .isLength({ min: 20, max: 30 })
    .withMessage('Invalid trade ID'),

  // Date validations
  startDate: query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid start date format'),
    
  endDate: query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Invalid end date format'),

  // Search validations
  searchQuery: query('q')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Search query must be 1-100 characters'),
};

// Validation middleware collections for common endpoints
export const validateUser = [
  validations.walletAddress,
  validations.email,
  validations.username,
  validations.displayName,
  validations.bio,
  handleValidationErrors,
];

export const validateTrade = [
  validations.tokenMint,
  validations.amount,
  validations.tradeType,
  validations.tradeSide,
  handleValidationErrors,
];

export const validateGuild = [
  validations.guildName,
  validations.guildDescription,
  handleValidationErrors,
];

export const validateMessage = [
  validations.messageContent,
  validations.messageType,
  handleValidationErrors,
];

export const validatePagination = [
  validations.page,
  validations.limit,
  validations.sortBy,
  validations.sortOrder,
  handleValidationErrors,
];

export const validateUserId = [
  validations.userId,
  handleValidationErrors,
];

export const validateGuildId = [
  validations.guildId,
  handleValidationErrors,
];

export const validateTradeId = [
  validations.tradeId,
  handleValidationErrors,
];

export const validateDateRange = [
  validations.startDate,
  validations.endDate,
  handleValidationErrors,
];

export const validateSearch = [
  validations.searchQuery,
  handleValidationErrors,
];

// Custom validation for wallet signature verification
export const validateWalletSignature = [
  body('signature')
    .isString()
    .isLength({ min: 80, max: 200 })
    .withMessage('Invalid signature format'),
  body('message')
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Invalid message format'),
  handleValidationErrors,
];

// File upload validation
export const validateFileUpload = [
  body('fileType')
    .optional()
    .isIn(['image/jpeg', 'image/png', 'image/gif'])
    .withMessage('Invalid file type. Only JPEG, PNG, and GIF are allowed'),
  handleValidationErrors,
];

// Price alert validation
export const validatePriceAlert = [
  body('tokenMint')
    .isString()
    .isLength({ min: 32, max: 44 })
    .withMessage('Invalid token mint address'),
  body('targetPrice')
    .isNumeric()
    .custom((value) => {
      const num = Number.parseFloat(value);
      if (num <= 0) {
        throw new Error('Target price must be greater than 0');
      }
      return true;
    }),
  body('condition')
    .isIn(['above', 'below'])
    .withMessage('Condition must be either "above" or "below"'),
  handleValidationErrors,
];