/**
 * Token Cleanup Utility
 *
 * Provides utilities for handling JWT token issues like invalid signatures,
 * expired tokens, and token cleanup for authentication problems.
 */

import jwt from 'jsonwebtoken';

/**
 * Validates a JWT token without throwing errors
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result with status and details
 */
export const validateToken = (token) => {
  if (!token) {
    return {
      valid: false,
      error: 'NO_TOKEN',
      message: 'No token provided'
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      valid: true,
      decoded: decoded,
      userId: decoded.userId,
      message: 'Token is valid'
    };
  } catch (error) {
    let errorType = 'UNKNOWN_ERROR';
    let message = 'Token validation failed';

    switch (error.name) {
      case 'JsonWebTokenError':
        if (error.message === 'invalid signature') {
          errorType = 'INVALID_SIGNATURE';
          message = 'Token signature is invalid - may be from different environment';
        } else if (error.message === 'jwt malformed') {
          errorType = 'MALFORMED_TOKEN';
          message = 'Token format is invalid';
        } else {
          errorType = 'JWT_ERROR';
          message = error.message;
        }
        break;

      case 'TokenExpiredError':
        errorType = 'EXPIRED_TOKEN';
        message = 'Token has expired';
        break;

      case 'NotBeforeError':
        errorType = 'TOKEN_NOT_ACTIVE';
        message = 'Token is not active yet';
        break;

      default:
        errorType = 'VALIDATION_ERROR';
        message = error.message;
    }

    return {
      valid: false,
      error: errorType,
      message: message,
      originalError: error.message
    };
  }
};

/**
 * Clears authentication cookies from response
 * @param {Object} res - Express response object
 * @param {Array} cookieNames - Array of cookie names to clear
 */
export const clearAuthCookies = (res, cookieNames = ['token', 'refreshToken']) => {
  cookieNames.forEach(cookieName => {
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
  });
};

/**
 * Extracts token from request (cookie or header)
 * @param {Object} req - Express request object
 * @returns {Object} Token extraction result
 */
export const extractToken = (req) => {
  let token = null;
  let source = null;

  // Strategy 1: Check for httpOnly Cookie (Web App)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    source = 'cookie';
  }
  // Strategy 2: Check for Bearer Token Header (API clients/Word Add-in)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      source = 'header';
    } catch (error) {
      return {
        token: null,
        source: null,
        error: 'MALFORMED_HEADER',
        message: 'Authorization header is malformed'
      };
    }
  }

  return {
    token,
    source,
    error: token ? null : 'NO_TOKEN',
    message: token ? `Token found in ${source}` : 'No token found'
  };
};

/**
 * Middleware to handle token cleanup on authentication errors
 * @param {Object} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const tokenCleanupMiddleware = (error, req, res, next) => {
  // Check if this is a JWT-related error
  if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError' ||
    error.message.includes('invalid signature') ||
    error.message.includes('jwt malformed')
  ) {
    console.log('🧹 Cleaning up invalid tokens due to JWT error:', error.message);

    // Clear authentication cookies
    clearAuthCookies(res);

    // Add cleanup header for client-side handling
    res.header('X-Token-Cleanup', 'true');
    res.header('X-Token-Error', error.name || 'JWT_ERROR');
  }

  next(error);
};

/**
 * Analyzes token issues and provides actionable feedback
 * @param {string} token - JWT token to analyze
 * @returns {Object} Analysis result with recommendations
 */
export const analyzeTokenIssue = (token) => {
  if (!token) {
    return {
      issue: 'NO_TOKEN',
      severity: 'low',
      action: 'LOGIN_REQUIRED',
      message: 'No authentication token found',
      recommendation: 'User needs to log in'
    };
  }

  const validation = validateToken(token);

  if (validation.valid) {
    return {
      issue: 'NONE',
      severity: 'none',
      action: 'CONTINUE',
      message: 'Token is valid',
      recommendation: 'No action needed'
    };
  }

  let severity = 'medium';
  let action = 'REAUTH_REQUIRED';
  let recommendation = 'User should log in again';

  switch (validation.error) {
    case 'INVALID_SIGNATURE':
      severity = 'high';
      action = 'CLEAR_AND_REAUTH';
      recommendation = 'Clear all tokens and force re-authentication - likely environment change';
      break;

    case 'EXPIRED_TOKEN':
      severity = 'low';
      action = 'REFRESH_OR_REAUTH';
      recommendation = 'Try token refresh first, then re-authentication';
      break;

    case 'MALFORMED_TOKEN':
      severity = 'medium';
      action = 'CLEAR_AND_REAUTH';
      recommendation = 'Clear malformed token and require re-authentication';
      break;

    case 'TOKEN_NOT_ACTIVE':
      severity = 'low';
      action = 'WAIT_OR_REAUTH';
      recommendation = 'Token not yet valid - check system time or re-authenticate';
      break;
  }

  return {
    issue: validation.error,
    severity,
    action,
    message: validation.message,
    recommendation,
    originalError: validation.originalError
  };
};

/**
 * Express route handler for token validation endpoint
 * GET /api/v1/auth/validate-token
 */
export const validateTokenEndpoint = (req, res) => {
  try {
    const { token, source } = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'NO_TOKEN',
        message: 'No authentication token found',
        action: 'LOGIN_REQUIRED'
      });
    }

    const validation = validateToken(token);
    const analysis = analyzeTokenIssue(token);

    if (validation.valid) {
      return res.json({
        success: true,
        valid: true,
        source: source,
        userId: validation.userId,
        message: 'Token is valid'
      });
    } else {
      // Clear invalid tokens
      clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        valid: false,
        error: validation.error,
        message: validation.message,
        action: analysis.action,
        recommendation: analysis.recommendation,
        source: source
      });
    }
  } catch (error) {
    console.error('Error in token validation endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'VALIDATION_FAILED',
      message: 'Token validation failed due to server error'
    });
  }
};

/**
 * Debug utility to log token information
 * @param {string} token - JWT token to debug
 * @param {string} context - Context where this debug is called from
 */
export const debugToken = (token, context = 'unknown') => {
  if (!token) {
    console.log(`🔍 [${context}] No token to debug`);
    return;
  }

  try {
    // Decode without verification to see payload
    const decoded = jwt.decode(token);
    console.log(`🔍 [${context}] Token debug:`);
    console.log(`   - Issued at: ${decoded.iat ? new Date(decoded.iat * 1000) : 'unknown'}`);
    console.log(`   - Expires at: ${decoded.exp ? new Date(decoded.exp * 1000) : 'unknown'}`);
    console.log(`   - User ID: ${decoded.userId || 'unknown'}`);
    console.log(`   - Token length: ${token.length}`);
    console.log(`   - Token start: ${token.substring(0, 20)}...`);

    // Try to validate
    const validation = validateToken(token);
    console.log(`   - Valid: ${validation.valid}`);
    if (!validation.valid) {
      console.log(`   - Error: ${validation.error}`);
      console.log(`   - Message: ${validation.message}`);
    }
  } catch (error) {
    console.log(`🔍 [${context}] Token debug failed:`, error.message);
  }
};

export default {
  validateToken,
  clearAuthCookies,
  extractToken,
  tokenCleanupMiddleware,
  analyzeTokenIssue,
  validateTokenEndpoint,
  debugToken
};
