import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AteelaboLogo from "../components/AteelaboLogo";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save logged-in user
      localStorage.setItem(
        "ateelabo_user",
        JSON.stringify(data.user)
      );
      localStorage.removeItem("ateelabo_token");

      // Go to Ateelabo AI
      navigate("/", {
  state: {
    user: data.user,
  },
});
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-surface min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4 text-white">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >

        {/* Header */}
        <div className="text-center mb-8">
          <AteelaboLogo size="w-24 h-24 mx-auto mb-3"/>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="
              text-3xl
              font-bold
              tracking-tight
              text-white
              sm:text-5xl
              md:text-6xl
            "
          >
            Welcome{" "}
            <span
              className="
                bg-gradient-to-r
                from-cyan-400
                via-blue-400
                to-purple-500
                bg-clip-text
                text-transparent
              "
            >
              Back
            </span>
          </motion.h1>



          <p className="text-gray-400 mt-2">
            Login to Ateelabo AI
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
        >

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">
              Password
            </label>

                        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 pr-12 outline-none focus:border-cyan-400 transition"
            />

            <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
  className={`
    absolute right-3 top-1/2 -translate-y-1/2
    p-2 rounded-lg
    transition-all duration-300
    ${
      showPassword
        ? "text-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
        : "text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/10"
    }
  `}
>
  {showPassword ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 transition-transform duration-300 scale-110"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 transition-transform duration-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.58 10.58a2 2 0 102.83 2.83"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.88 4.24A9.77 9.77 0 013 12c1.73 3.4 5.06 6 9 6a9.77 9.77 0 004.12-.88"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.12 19.76A9.77 9.77 0 0021 12a9.77 9.77 0 00-3.05-4.27"
      />
    </svg>
  )}
</button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Register */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Create account
            </Link>
          </p>

        </form>

        {/* Back */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-white transition"
          >
            ← Back to Ateelabo AI
          </Link>
        </div>

      </motion.div>
    </div>
  );
}