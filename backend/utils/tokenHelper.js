/**
 * Extract JWT token from request
 * Checks both cookies and Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null
 */
export const getTokenFromRequest = (req) => {
  // Authorization header first (works when third-party cookies are blocked),
  // accepts both "Bearer <token>" and the raw token
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (token && token !== 'null' && token !== 'undefined') return token;
  }

  // Fall back to the cookie
  return req.cookies?.tokenlogin || null;
};

/**
 * Create authentication middleware
 * Checks both cookies and Authorization header for token
 * @param {Object} jwt - JWT library instance
 * @param {string} secretKey - JWT secret key
 * @returns {Function} - Express middleware function
 */
export const createAuthMiddleware = (jwt, secretKey) => {
  return (req, res, next) => {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      next();
    } catch (error) {
      console.log("Token verification error:", error.message);
      res.status(401).json({ msg: "Token is not valid" });
    }
  };
};
