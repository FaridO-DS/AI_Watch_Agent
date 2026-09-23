import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    try {
        // 1. Retrieve the authentication cookie
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - No token provided" });
        }

        // 2. Verify and decode the JSON Web Token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ error: "Unauthorized - Invalid token structure" });
        }
        
        // 3. Fetch user data while removing sensitive password hash (Optimized with .lean())
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user) {
            return res.status(404).json({ error: "Unauthorized - User account not found" });
        }

        // 4. Inject the safe user payload into the request object for upcoming handlers
        req.user = user;
        next();

    } catch (error) {
        // Distinguish expired tokens from other processing exceptions
        if (error.name === "TokenExpiredError") {
            console.warn("[Auth Middleware] Authentication token has expired.");
            return res.status(401).json({ error: "Unauthorized - Token has expired" });
        }

        console.error("Error in protectRoute middleware:", error.message);
        return res.status(401).json({ error: "Unauthorized - Invalid or corrupted token" });
    }
};
