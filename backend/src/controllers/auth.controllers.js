import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";

// Standard cookie options matching your deployment topology
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "lax",
  path: "/" // Ensures token scoping remains uniform across entrypoints
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // 1. Inputs validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // 2. Email formatting and regex validation
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // 3. Optimized conflict check (using .exists instead of full document fetch)
    const userExists = await User.exists({ email: sanitizedEmail });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 4. Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Instantiation and database persistence
    const newUser = new User({
      fullName: fullName.trim(),
      email: sanitizedEmail,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // 6. Generate authentication state / cookie
    generateToken(savedUser._id, res);

    return res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

  } catch (error) {
    console.error("Error in signup controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const sanitizedEmail = email.trim().toLowerCase();

    // Fetch user with credentials validation
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    } 

    // Generate JWT cookie
    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  
  } catch (error) {
    console.error("Error in login controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (_, res) => {
  // Fixed security flaw: secure should be true in production, false only in local development
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.status(200).json({ message: "Logged out successfully" });
};
