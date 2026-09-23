import express from "express";
import { watch, getWatchHistory } from "../controllers/watch.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// Apply security and authentication middlewares globally to all watch endpoints
router.use(arcjetProtection, protectRoute);

// Fixed handler mapping from createTechWatch to watch
router.post("/", watch);

// Fixed path schema to eliminate duplicate /api segment and match your frontend fetch
router.get('/history', getWatchHistory);

export default router;
