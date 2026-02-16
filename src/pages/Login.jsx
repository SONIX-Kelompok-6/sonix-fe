import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import api from "../api/axios"; 

export default function Login() {
  const navigate = useNavigate(); 

  // renew: input username to login
const [formData, setFormData] = useState({
    identifier: "", // identifier means email or username
    password: ""
  });
  const [error, setError] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);

  // 2. HANDLER: Saat ngetik
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 3. HANDLER: Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    try {
      // ✅ UPDATE: Pakai 'api.post' dan path relatif
      // Base URL (Railway) akan otomatis ditempel sama axios.js
      const response = await api.post("/api/login/", {
        identifier: formData.identifier,
        password: formData.password
      });

      console.log("Login Success:", response.data);
      
      // ✅ SIMPAN TOKEN: Wajib sama dengan key yang ada di axios.js ('userToken')
      localStorage.setItem("userToken", response.data.token); 
      localStorage.setItem("userEmail", response.data.email);

      // Logic Redirect
      if (response.data.has_profile) {
        alert("Login Successful! Welcome back.");
        navigate("/"); 
      } else {
        alert("Login Successful! Please complete your profile first.");
        navigate("/create-profile"); 
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Error Handling
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Invalid credentials or password.");
      } else if (err.request) {
        setError("Network Error. Cannot connect to server.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-28">
      
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Login</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your details to access your account.
          </p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="email">
              Username or Email Address
            </label>
            <input 
              type="identifier" 
              id="identifier" 
              value={formData.identifier} 
              onChange={handleChange} 
              placeholder="runner@example.com" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
              required 
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="password">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
              required 
            />
            <div className="text-right mt-2">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Forgot Password?
              </a>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`mt-2 w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#0a0a5c] hover:bg-blue-900"
            }`}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-8 text-sm">
          Don't have an account? 
          <Link to="/register" className="text-blue-600 font-bold ml-1 hover:underline">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}