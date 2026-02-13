  import { useState } from "react";
  import { Link, useNavigate } from "react-router-dom"; 
  import axios from "axios"; 

  export default function Login() {
    const navigate = useNavigate(); 

    // 1. STATE (TIDAK BERUBAH)
    const [formData, setFormData] = useState({
      email: "",
      password: ""
    });
    const [error, setError] = useState(""); 
    const [isLoading, setIsLoading] = useState(false); 

    // 2. HANDLER: Saat ngetik (TIDAK BERUBAH)
    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // 3. HANDLER: Submit (DI-UPDATE LOGIC-NYA)
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(""); 
      setIsLoading(true);

      try {
        // Tembak API Login Django
        const response = await axios.post("http://127.0.0.1:8000/api/login/", {
          email: formData.email,
          password: formData.password
        });

        console.log("Login Success:", response.data);
        
        // --- PERUBAHAN UTAMA DISINI ---
        
        // A. Simpan Token (Wajib buat akses Create Profile nanti)
        localStorage.setItem("userToken", response.data.token); 
        localStorage.setItem("userEmail", response.data.email);

        // B. Logic Traffic Controller
        if (response.data.has_profile) {
          // Kalau User Lama (Punya Profile) -> Langsung Home
          alert("Login Successful! Welcome back.");
          navigate("/"); 
        } else {
          // Kalau User Baru (Belum Punya Profile) -> Isi Profile Dulu
          alert("Login Successful! Please complete your profile first.");
          navigate("/create-profile"); 
        }

        // -----------------------------

      } catch (err) {
        console.error("Login Error:", err);
        if (err.response && err.response.data) {
          setError(err.response.data.error || "Invalid email or password.");
        } else {
          setError("Network Error. Is Django running?");
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      // UI TIDAK ADA YANG BERUBAH SAMA SEKALI
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
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                value={formData.email} 
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