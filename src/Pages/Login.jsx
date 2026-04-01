import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);

    if (success) {
      // 🚀 Get the fresh user state from the store after login
      const user = useUserStore.getState().user;

      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0a0a0a] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 bg-[#050505] border border-[#B6B09F]/20 rounded-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#EAE4D5] tracking-tight">
            Artist Portal
          </h2>
          <p className="text-[#B6B09F] mt-2 font-light">
            Sign in to manage your releases and royalties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#EAE4D5] text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#B6B09F]/40 rounded-lg text-[#EAE4D5] placeholder-[#B6B09F]/50 focus:border-[#EAE4D5] focus:outline-none transition-colors"
              placeholder="artist@example.com"
              required
            />
          </div>

          <div>
            {/* 👇 ADDED flex wrapper here to place anchor on the right */}
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[#EAE4D5] text-sm font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[#B6B09F] text-xs hover:text-[#EAE4D5] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-[#B6B09F]/40 rounded-lg text-[#EAE4D5] placeholder-[#B6B09F]/50 focus:border-[#EAE4D5] focus:outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#EAE4D5] text-[#0a0a0a] font-bold rounded-lg hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-[#B6B09F] text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#EAE4D5] font-medium hover:underline"
          >
            Apply to Join
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
