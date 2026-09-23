import express from "express";
import { signup, login, logout } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();
router.use(arcjetProtection);
// Apply Arcjet security policy strictly to endpoints exposed to automation or brute-force
router.post("/signup", signup);
router.post("/login", login);

// Standard endpoints without heavy bot analysis needs
router.post("/logout", logout);

// Verification route to check user session state on React application startup
router.get("/check", protectRoute, (req, res) => {
    return res.status(200).json(req.user);
});

export default router;
