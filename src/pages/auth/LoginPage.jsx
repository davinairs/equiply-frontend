import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import api from "../../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/equipments");
      }
    } catch (err) {
      console.error("Error caught:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Incorrect email or password. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-100 w-full max-w-md"
      >
        <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <img src={logo} alt="Equiply" className="h-8 sm:h-10" />
          <p className="text-(length:--font-size-body-sm,0.875rem) text-text-muted mt-3 sm:mt-4">
            Welcome back. Please log in to your account.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-error-light text-error p-3.5 rounded-xl mb-5 sm:mb-6 text-(length:--font-size-body-sm,0.875rem) border border-error/10"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-(length:--font-size-caption,0.75rem) font-medium text-text-muted mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-(length:--font-size-body-sm,0.875rem) text-text-primary transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 hover:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-(length:--font-size-caption,0.75rem) font-medium text-text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-(length:--font-size-body-sm,0.875rem) text-text-primary transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-slate-50/50 hover:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-white py-2.5 rounded-xl font-medium text-(length:--font-size-body-sm,0.875rem) flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 cursor-pointer"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default LoginPage;
