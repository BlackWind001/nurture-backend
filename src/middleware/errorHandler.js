/**
 * Global error handler middleware
 * Handles all errors passed to next(error) or thrown in async routes
 */
function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Clerk authentication errors
  if (err.message?.includes('Unauthenticated') || err.status === 401) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'UNAUTHENTICATED'
    });
  }

  // Clerk authorization errors
  if (err.message?.includes('Unauthorized') || err.status === 403) {
    return res.status(403).json({ 
      error: 'Forbidden - insufficient permissions',
      code: 'FORBIDDEN'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({ 
      error: err.message || 'Invalid request data',
      code: 'VALIDATION_ERROR'
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({ 
      error: err.message || 'Resource not found',
      code: 'NOT_FOUND'
    });
  }

  // Default server error
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
