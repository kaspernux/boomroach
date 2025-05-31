import type { Request, Response, NextFunction } from 'express'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { ZodError } from 'zod'
import {
  ApiError,
  ValidationError,
  createErrorResponse,
  isOperationalError,
  ERROR_CODES
} from '../utils/errors'
import { logger, logError, logSecurity } from '../utils/logger'

/**
 * Central error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Don't handle if response already sent
  if (res.headersSent) {
    return next(error)
  }

  // Log the error
  logError(error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id || 'anonymous'
  })

  // Handle known error types
  const handledError = handleKnownErrors(error)
  const statusCode = handledError.statusCode || 500

  // Log security events for certain errors
  if (statusCode === 401 || statusCode === 403) {
    logSecurity('UNAUTHORIZED_ACCESS_ATTEMPT', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      error: error.message
    })
  }

  // Create error response
  const errorResponse = createErrorResponse(
    handledError,
    req.originalUrl,
    req.method,
    process.env.NODE_ENV === 'development' // Include stack trace in development
  )

  // Set appropriate headers
  if (handledError.name === 'RateLimitError' && (handledError as any).retryAfter) {
    res.set('Retry-After', String((handledError as any).retryAfter))
  }

  res.status(statusCode).json(errorResponse)
}

/**
 * Handle known error types and convert them to standardized ApiError format
 */
function handleKnownErrors(error: Error): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error
  }

  // JWT Errors
  if (error instanceof JsonWebTokenError) {
    return new ApiError(401, 'Invalid authentication token', {
      code: ERROR_CODES.INVALID_TOKEN,
      type: 'JWT_ERROR'
    })
  }

  if (error instanceof TokenExpiredError) {
    return new ApiError(401, 'Authentication token has expired', {
      code: ERROR_CODES.TOKEN_EXPIRED,
      type: 'JWT_EXPIRED'
    })
  }

  // Zod Validation Errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))

    return new ValidationError('Validation failed', validationErrors)
  }

  // Prisma Errors
  if (error instanceof PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  if (error instanceof PrismaClientValidationError) {
    return new ApiError(400, 'Invalid database query parameters', {
      code: ERROR_CODES.INVALID_INPUT,
      type: 'PRISMA_VALIDATION_ERROR'
    })
  }

  // Network/HTTP Errors (from external API calls)
  if (error.name === 'FetchError' || error.name === 'AbortError') {
    return new ApiError(502, 'External service unavailable', {
      code: ERROR_CODES.PRICE_FEED_ERROR,
      service: 'external_api'
    })
  }

  // Solana Web3 Errors
  if (error.message.includes('Transaction simulation failed') ||
      error.message.includes('Blockhash not found')) {
    return new ApiError(503, 'Blockchain operation failed', {
      code: ERROR_CODES.SOLANA_RPC_ERROR,
      blockchain: 'solana'
    })
  }

  // Default to internal server error
  return new ApiError(500, 'Internal server error', {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    originalMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: PrismaClientKnownRequestError): ApiError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field'
      return new ApiError(409, `${field} already exists`, {
        code: ERROR_CODES.INVALID_INPUT,
        field,
        type: 'UNIQUE_CONSTRAINT_VIOLATION'
      })

    case 'P2025':
      // Record not found
      return new ApiError(404, 'Record not found', {
        code: ERROR_CODES.USER_NOT_FOUND, // Generic, can be more specific based on context
        type: 'RECORD_NOT_FOUND'
      })

    case 'P2003':
      // Foreign key constraint violation
      return new ApiError(400, 'Invalid reference to related record', {
        code: ERROR_CODES.INVALID_INPUT,
        type: 'FOREIGN_KEY_CONSTRAINT_VIOLATION'
      })

    case 'P2016':
      // Query interpretation error
      return new ApiError(400, 'Invalid query parameters', {
        code: ERROR_CODES.INVALID_INPUT,
        type: 'QUERY_INTERPRETATION_ERROR'
      })

    case 'P1001':
      // Database connection error
      return new ApiError(503, 'Database connection failed', {
        code: ERROR_CODES.DATABASE_ERROR,
        type: 'DATABASE_CONNECTION_ERROR'
      })

    default:
      return new ApiError(500, 'Database operation failed', {
        code: ERROR_CODES.DATABASE_ERROR,
        prismaCode: error.code,
        type: 'PRISMA_ERROR'
      })
  }
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`)
  next(error)
}

/**
 * Validation error helper
 */
export const createValidationError = (field: string, message: string) => {
  return new ValidationError(`Validation failed for ${field}`, [
    { field, message, code: 'invalid' }
  ])
}

/**
 * Check if error should be reported to external error tracking
 */
export const shouldReportError = (error: Error): boolean => {
  // Don't report operational errors like validation failures
  if (isOperationalError(error)) {
    const apiError = error as ApiError
    // Only report server errors (5xx) for operational errors
    return apiError.statusCode >= 500
  }

  // Report all non-operational errors (programming errors)
  return true
}

/**
 * Safe error message for production
 */
export const getSafeErrorMessage = (error: Error): string => {
  if (process.env.NODE_ENV === 'production' && !isOperationalError(error)) {
    return 'Internal server error'
  }
  return error.message
}
