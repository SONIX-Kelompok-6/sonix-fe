import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ForgotPassword() {
  // STATE
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // Untuk pesan sukses
  const [error, setError] = useState("");     // Untuk pesan error

  // HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Arahkan ke endpoint FORGOT PASSWORD
      await axios.post("http://127.0.0.1:8000/api/forgot-password/", { 
        email: email 
      });
      
      setMessage("Link reset password telah dikirim ke email kamu!");
      setEmail(""); // Kosongkan form jika sukses

    } catch (err) {
      const data = err.response?.data;
      // Menangkap pesan error dari backend
      if (data?.error) setError(data.error);
      else setError("Gagal mengirim link. Pastikan email terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-20">
      <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Forgot Password?</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Don't worry! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* ALERT MESSAGES */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 text-center font-medium">
            {message}
          </div>
        )}

        {/* FORM */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="runner@example.com"
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
            {loading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* FOOTER LINK */}
        <p className="text-center text-slate-600 mt-6 text-sm">
          Remember your password? 
          <Link to="/login" className="text-blue-600 font-bold ml-1 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}