const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'boardcraft_secret_key_13_college';

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ success: false, error: 'No authorization header provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ success: false, error: 'Token format must be Bearer <token>' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, username }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired authorization token' });
    }
}

module.exports = authMiddleware;
