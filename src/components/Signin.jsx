import { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const Signin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for any messages passed via navigation state
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", {
        email: formData.email,
        password: formData.password,
      });
      // Store tokens in localStorage
      localStorage.setItem("access_token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Get user details to check if superuser
      const userResponse = await api.get("/auth/me/");
      const userData = userResponse.data;
      console.log(userData);
      // Redirect based on user role
      if (userData?.data?.role === "superuser") {
        // Redirect superuser to custom admin dashboard
        navigate("/admin-dashboard");
      } else if (userData?.data?.role === "doctor") {
        console.log("doctor");
        // Redirect doctors to the doctor dashboard
        navigate("/doctor-dashboard");
      } else {
        // Redirect regular users to the main dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-between">
      {/* Left Section */}
      <div className="flex-1 pr-12">
        <h1 className="mb-6 text-2xl font-bold text-red-600">
          Heart Disease Prediction
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Welcome Back to Heart Health Insights
        </h2>
        <p className="mb-8 text-gray-600">
          Sign in to access your personalized heart health dashboard and
          continue monitoring your cardiovascular well-being.
        </p>
        <button className="rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700">
          Learn More
        </button>
      </div>

      {/* Right Section - Sign In Form */}
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-red-700">Sign In</h3>
            <p className="mt-1 text-sm text-gray-600">
              Please enter your credentials to continue
            </p>
          </div>

          {message && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-red-600 hover:text-red-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-red-600 hover:text-red-700">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
