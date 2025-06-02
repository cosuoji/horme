import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ firstName,lastName, email, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			toast.error("Passwords do not match");
			return false
		}

		try {
			const res = await axios.post("/auth/signup", { firstName, lastName, email, password });
			set({ user: res.data, loading: false });
			return true 
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
			return false;
		}
	},
	login: async (email, password) => {
		set({ loading: true });
	
		try {
		  const res = await axios.post("/auth/login", { email, password });

		  set({ user: res.data, loading: false });
		  return true;
		} catch (error) {
		  set({ loading: false });
		  console.error('Login failed:', error.response?.data); // Enhanced logging
		  return false;
		}
	  },

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

		checkAuth: async () => {
		console.log("Starting auth check");
		try {
			const response = await axios.get("/auth/profile");
			console.log("Auth check successful", response.data);
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log("Auth check failed", error.message);
			set({ checkingAuth: false, user: null });
		}
		},
	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
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
	}
);