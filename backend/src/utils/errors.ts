/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: any

  constructor(
    statusCode: number,
    message: string,
    context?: any,
    isOperational = true,
    stack = ''
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Validation Error class for input validation failures
 */
export class ValidationError extends ApiError {
  public readonly errors: any[]

  constructor(message: string, errors: any[] = []) {
    super(400, message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

/**
 * Authentication Error class
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization Error class
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Not Found Error class
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict Error class
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message)
    this.name = 'ConflictError'
  }
}

/**
 * Rate Limit Error class
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter?: number

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(429, message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * External Service Error class
 */
export class ExternalServiceError extends ApiError {
  public readonly service: string

  constructor(service: string, message = 'External service error') {
    super(502, message)
    this.name = 'ExternalServiceError'
    this.service = service
  }
}

/**
 * Database Error class
 */
export class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed', originalError?: Error) {
    super(500, message, { originalError: originalError?.message })
    this.name = 'DatabaseError'
  }
}

/**
 * Blockchain Error class for Solana-related errors
 */
export class BlockchainError extends ApiError {
  public readonly transactionSignature?: string
  public readonly blockchainErrorCode?: string

  constructor(
    message = 'Blockchain operation failed',
    transactionSignature?: string,
    blockchainErrorCode?: string
  ) {
    super(503, message)
    this.name = 'BlockchainError'
    this.transactionSignature = transactionSignature
    this.blockchainErrorCode = blockchainErrorCode
  }
}

/**
 * Trading Error class for trading-specific errors
 */
export class TradingError extends ApiError {
  public readonly symbol?: string
  public readonly orderType?: string

  constructor(
    message = 'Trading operation failed',
    symbol?: string,
    orderType?: string
  ) {
    super(400, message)
    this.name = 'TradingError'
    this.symbol = symbol
    this.orderType = orderType
  }
}

/**
 * Check if error is operational (expected) or programming error
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof ApiError) {
    return error.isOperational
  }
  return false
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    message: string
    code?: string
    details?: any
    timestamp: string
    path?: string
    method?: string
    stack?: string
  }
}

/**
 * Create standardized error response
 */
export const createErrorResponse = (
  error: Error,
  path?: string,
  method?: string,
  includeStack = false
): ErrorResponse => {
  const response: ErrorResponse = {
    error: {
      message: error.message,
      timestamp: new Date().toISOString(),
      path,
      method
    }
  }

  if (error instanceof ApiError) {
    response.error.code = error.name
    if (error.context) {
      response.error.details = error.context
    }
  }

  if (includeStack && error.stack) {
    response.error.stack = error.stack
  }

  return response
}

/**
 * Error codes for client-side handling
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resources
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  GUILD_NOT_FOUND: 'GUILD_NOT_FOUND',
  QUEST_NOT_FOUND: 'QUEST_NOT_FOUND',
  TRADE_NOT_FOUND: 'TRADE_NOT_FOUND',

  // Business Logic
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  GUILD_FULL: 'GUILD_FULL',
  QUEST_ALREADY_COMPLETED: 'QUEST_ALREADY_COMPLETED',
  LEVEL_REQUIREMENT_NOT_MET: 'LEVEL_REQUIREMENT_NOT_MET',

  // External Services
  SOLANA_RPC_ERROR: 'SOLANA_RPC_ERROR',
  JUPITER_API_ERROR: 'JUPITER_API_ERROR',
  PRICE_FEED_ERROR: 'PRICE_FEED_ERROR',

  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]
