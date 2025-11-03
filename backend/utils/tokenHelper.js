/**
 * Extract JWT token from request
 * Checks both cookies and Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} - JWT token or null
 */
export const getTokenFromRequest = (req) => {
  // Check cookies first
  let token = req.cookies?.tokenlogin || req.headers.authorization;
  
  // If no cookie, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  return token || null;
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
