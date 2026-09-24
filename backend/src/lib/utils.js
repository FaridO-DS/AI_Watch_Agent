import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

/**
 * Generates a secure JSON Web Token and injects it into an HTTP-only response cookie.
 * @param {string|Object} userID - The Mongoose User unique identifier (_id)
 * @param {Object} res - The Express response object
 * @returns {string} The signed JWT token
 */
export const generateToken = (userID, res) => {
    const { JWT_SECRET, NODE_ENV } = ENV;
    
    if (!JWT_SECRET) {
        throw new Error('CRITICAL CONFIGURATION ERROR: JWT_SECRET is not configured inside env variables.');
    }

    // Convert ObjectId instances to an immutable primitive string layout safely
    const payloadId = userID.toString();

    // 1. Sign the token with a 7-day duration lifecycle
    const token = jwt.sign({ id: payloadId }, JWT_SECRET, { expiresIn: '7d' });
    
    // 2. Compute 7 days expiration parameter in milliseconds
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // 3. Inject the payload within a hardened browser container cookie
    res.cookie('token', token, { 
        maxAge: SEVEN_DAYS_MS, 
        httpOnly: true, // Safeguards cookie from client-side XSS scripting theft
        secure: true, 
        sameSite: 'strict'
    });
    
    return token;
};
