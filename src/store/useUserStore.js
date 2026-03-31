import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({
    legalName,
    stageName,
    email,
    password,
    confirmPassword,
  }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
      return false;
    }

    try {
      const res = await axios.post("api/auth/register", {
        legalName,
        stageName,
        email,
        password,
      });
      set({ loading: false });
      // Show success message from backend telling them to check email
      toast.success(
        res.data.message || "Please check your email to verify your account!",
      );
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "An error occurred");
      return false;
    }
  },

  // 📩 NEW: Verify Email
  verifyEmail: async (token) => {
    set({ loading: true });
    try {
      const res = await axios.post("api/auth/verify-email", { token });
      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Verification failed");
      return false;
    }
  },

  // 📩 NEW: Forgot Password
  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const res = await axios.post("api/auth/forgot-password", { email });
      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Password reset failed");
      return false;
    }
  },

  // 📩 NEW: Reset Password
  resetPassword: async (token, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("api/auth/reset-password", {
        token,
        password,
      });
      set({ loading: false });
      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Password reset failed");
      return false;
    }
  },

  verifyBvn: async (bvnData) => {
    set({ loading: true });
    try {
      // Send the BVN to the backend
      const res = await axios.post("api/users/verify-bvn", { bvn: bvnData });

      // Update the user state with the new bvnStatus (e.g., 'pending' or 'verified')
      set((state) => ({
        user: { ...state.user, bvnStatus: res.data.bvnStatus },
        loading: false,
      }));

      toast.success(res.data.message);
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "BVN verification failed");
      return false;
    }
  },
  // Inside useUserStore.js
  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      set({ user: res.data, loading: false });
      return true;
    } catch (error) {
      // 🚀 CRITICAL: Reset loading even if the password is wrong!
      set({
        loading: false,
        error: error.response?.data?.message || "Login failed",
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await axios.post("api/auth/logout");
      set({ user: null });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred during logout",
      );
    }
  },

  checkAuth: async () => {
    //console.log("Starting auth check");
    try {
      const response = await axios.get("api/users/profile");
      // console.log("Auth check successful", response.data);
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      // console.log("Auth check failed", error.message);
      set({ checkingAuth: false, user: null });
    }
  },
  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("api/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
