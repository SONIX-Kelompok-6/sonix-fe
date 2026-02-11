import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // STATE
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // --- FUNGSI AMBIL TOKEN DARI URL HASH (#) ---
  const getHashParams = () => {
    const hash = location.hash.substring(1); // Buang tanda '#'
    const params = {};
    hash.split('&').forEach(part => {
      const [key, value] = part.split('=');
      params[key] = value;
    });
    return params;
  };

  // HANDLE CHANGE
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // HANDLE SUBMIT
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1. Validasi Password Cocok
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // 2. Ambil Access Token dari URL
    const params = getHashParams();
    const accessToken = params.access_token;
    const refreshToken = params.refresh_token; // Opsional, jaga-jaga kalau backend butuh

    if (!accessToken) {
      setError("Link tidak valid atau sudah kadaluarsa. Silakan minta reset ulang.");
      setLoading(false);
      return;
    }

    try {
      // 3. Arahkan ke API Backend
      await axios.post("http://127.0.0.1:8000/api/reset-password/", {
        access_token: accessToken,
        refresh_token: refreshToken,
        new_password: formData.password
      });

      setSuccess(true);
      
      // Redirect otomatis ke login setelah 3 detik
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setError(data.error);
      else setError("Gagal mereset password. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // TAMPILAN SUKSES
  if (success) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-20">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Updated!</h2>
          <p className="text-slate-500 mb-6">
            Your password has been changed successfully. Redirecting to login...
          </p>
          <button 
            onClick={() => navigate("/login")}
            className="w-full text-white font-bold py-3 rounded-lg bg-[#0a0a5c] hover:bg-blue-900 transition-all"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN FORM
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-20">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">New Password</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Please enter your new password below.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
          
          {/* New Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="password">
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:border-[#0a0a5c] focus:ring-1 focus:ring-[#0a0a5c] outline-none transition-all"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:border-[#0a0a5c] focus:ring-1 focus:ring-[#0a0a5c] outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full text-white font-bold py-3.5 rounded-lg bg-[#0a0a5c] hover:bg-blue-900 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6 text-sm">
            <Link to="/login" className="text-slate-500 hover:text-slate-800 transition-colors">
              Cancel and Back to Login
            </Link>
        </p>

      </div>
    </div>
  );
}