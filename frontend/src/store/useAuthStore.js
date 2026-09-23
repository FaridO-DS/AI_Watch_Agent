import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

 // Check auth status on application startup via session/cookies)
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user || res.data });
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

   // Register a new user account
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user || res.data });
      toast.success("Account created successfully !");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to sign up.";
      toast.error(errorMsg);
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Authenticate an existing user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user || res.data });
      toast.success("Logged in successfully");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to log in.";
      toast.error(errorMsg);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Clear session and terminate authentication
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Logout error:", error);
      toast.error("Error logging out");
    }
  },
}));
