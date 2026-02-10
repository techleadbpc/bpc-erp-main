import axios from "axios";
import { toast } from "@/hooks/use-toast";

// Create an Axios instance
const api = axios.create({
  // baseURL: "http://localhost:3000/api/",
  // baseURL: "https://mechanical.bpcinfraprojects.co.in/api/",
  baseURL: "https://cpc-erp-server.onrender.com/api/",
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": "69420", // Custom header
    "Content-Type": "application/json", // Default Content-Type
    Accept: "application/json", // Accept header
  },
});


// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  (error) => {
    // Handle errors (e.g., logging, showing error messages)
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("Response Error:", error.response);
      toast({
        title: "Error",
        description: error.response.data.message || "Something went wrong!",
        variant: "destructive",
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error("Request Error:", error.request);
      toast({
        title: "Network Error",
        description: "No response from server. Please try again later.",
        variant: "destructive",
      });
    } else {
      // Something else caused the error
      console.error("General Error:", error.message);
      toast({
        title: "Network Error",
        description: "No response from server. Please try again later.",
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  }
);

export default api;
