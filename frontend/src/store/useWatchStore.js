import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useWatchStore = create((set) => ({
  history: [],
  currentReport: null,
  isGenerating: false,
  isLoadingHistory: false,
  
  // Action to launch the watch agent analysis
  launchWatch: async (topic, filteredUrls) => {
    set({ isGenerating: true, currentReport: null });
    
    try {
      // Clean request syntax using Axios capabilities
      const response = await axiosInstance.post("/api/watch", { 
        topic, 
        urls: filteredUrls 
      });

      const data = response.data;
      
      // Update state with the new report and prepend it to history
      set((state) => ({
        currentReport: data,
        history: [data, ...state.history]
      }));
      
      toast.success("Watch agent successfully completed!");
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      set({ isGenerating: false });
    }
  },
      
  // Action to fetch historical data for the authenticated user
  fetchHistory: async () => {
    set({ isLoadingHistory: true });
    try {
      const res = await axiosInstance.get("/api/watch/history");
      const historyData = res.data.success ? res.data.history : res.data;
      set({ history: Array.isArray(historyData) ? historyData : [] });
    } catch (error) {
      console.error("Fetch History Error:", error);
      toast.error("Could not load history.");
    } finally {
      set({ isLoadingHistory: false });
    }
  },
}));
