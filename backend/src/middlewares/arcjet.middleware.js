import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
    // 1. SAFELY BYPASS CORS PREFLIGHT REQUESTS
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        // Extract IP safely from multiple Express standard properties
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || "127.0.0.1";

        // 2. EXPLICITLY PASS THE IP TO ARCJET
        // We override the automatic detection by forcing the 'ipSrc' option payload.
        const decision = await aj.protect(req, { ip: clientIp });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                console.warn(`[Arcjet Blocked] Rate limit exceeded for IP: ${clientIp}`);
                return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
            } 
            
            if (decision.reason.isBot()) {
                console.warn(`[Arcjet Blocked] Bot access denied for IP: ${clientIp}`);
                return res.status(403).json({ error: "Bot access denied." });
            } 
            
            console.warn(`[Arcjet Blocked] Security policy restriction for IP: ${clientIp}`);
            return res.status(403).json({ error: "Access denied by security policy." });
        }

        // Detect and block malicious or spoofed automated bots safely checking results array
        if (decision.results?.some(isSpoofedBot)) {
            console.warn(`[Arcjet Blocked] Spoofed/Malicious bot detected for IP: ${clientIp}`);
            return res.status(403).json({
                error: "Access denied. Malicious spoofed bot activity detected."
            });
        }

        // If all security checks pass, proceed to the next middleware or controller
        next();

    } catch (error) {
        // Fail-open strategy
        console.error("Arcjet protection error, falling back to open access:", error.message);
        next();
    } 
};
