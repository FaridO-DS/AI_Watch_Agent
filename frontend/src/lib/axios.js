import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.ENV==="development" 
  ? "http://localhost:5001" 
  : "/",
  withCredentials: true,
});