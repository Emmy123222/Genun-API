const jwt = require('jsonwebtoken');

const conFig = require('../configure');


exports.auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token');
        
        // Check if no token
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token, authorization denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, conFig.jwtKey);
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired, please login again' 
            });
        }
        
        // For any other errors
        res.status(500).json({ 
            success: false,
            message: 'Server error during authentication' 
        });
    }
};