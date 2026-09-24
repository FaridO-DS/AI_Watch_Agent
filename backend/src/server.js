import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path";

import authRoutes from './routes/auth.route.js';
import watchRoutes from './routes/watch.route.js';

import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';

const app = express();
const PORT = ENV.PORT || 5001;

// 1. Core Global Middlewares
app.use(express.json({ limit: "1mb" })); // Parses incoming JSON payloads
app.use(cors({origin: ENV.CLIENT_URL, credentials: true})); // req.headers
app.use(cookieParser()); // Parses cookies attached to the client requests

// API Routes Mapping
// Auth endpoints (matches useAuthStore calls e.g., /auth/login)
app.use('/auth', authRoutes);

// Watch agent endpoints (matches useWatchStore calls e.g., /api/watch)
app.use('/api/watch', watchRoutes);

// Make ready for deployment
if (ENV.NODE_ENV === "production") {
    const disPath = path.join(process.cwd(),"dist");
    app.use(express.static(disPath));
    app.get("*", (_, res) => {
        res.sendFile(path.join(disPath, "index.html"), (err) => {
	  if (err) {
		console.error("Critical error when sending index.html :", err);
		res.status(500).send("Check dist directory location.");
   	  }
	});
    });
}

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
