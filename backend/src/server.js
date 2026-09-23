import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import watchRoutes from './routes/watch.route.js';

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();
const PORT = ENV.PORT || 5001;

// 1. Proxy & Trust Configuration
// Essential for secure HTTP-only cookies to work behind an Nginx reverse proxy
app.set("trust proxy", 1);

// 2. Core Global Middlewares
app.use(express.json({ limit: "1mb" })); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies attached to the client requests

// 3. CORS Configuration (Development Only)
// Redundant in production since Nginx acts as a single-origin proxy.
if (ENV.NODE_ENV !== "production") {
    app.use(cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Standard Vite dev ports
        credentials: true, // Allows sharing JWT cookies during local testing
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}

// 4. API Routes Mapping
// Auth endpoints (matches useAuthStore calls e.g., /auth/login)
app.use('/auth', authRoutes);

// Watch agent endpoints (matches useWatchStore calls e.g., /api/watch)
app.use('/api/watch', watchRoutes);

// 5. Server Initialization & Database Handshake
app.listen(PORT, async () => {
    console.log(`[Server] Core runtime online. Listening on port: ${PORT}`);
    try {
        await connectDB();
        console.log(`[Database] MongoDB handshake connection established successfully.`);
    } catch (dbError) {
        console.error(`[Database Critical] Core database fallback connection failed:`, dbError.message);
    }
});
