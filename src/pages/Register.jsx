import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Tambah useNavigate
import axios from "axios"; // Tambah axios
import TermsModal from "../components/TermsModal";

export default function Register() {
  const navigate = useNavigate(); // Hook untuk pindah halaman setelah sukses
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Validasi Real-time
    if (id === "confirmPassword") {
      if (value !== formData.password) setError("Passwords do not match!");
      else setError("");
    }
    if (id === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) setError("Passwords do not match!");
      else setError("");
    }
  };

  const handleSubmit = async (e) => { // Ubah jadi async
    e.preventDefault();
    setError(""); // Reset error lama

    // 1. Validasi Client Side
    if (formData.password !== formData.confirmPassword) {
      setError("Please make sure passwords match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions to register.");
      return;
    }

    // 2. Mulai Request ke Django
    setIsLoading(true);

    try {
      // Tembak API Backend
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        email: formData.email,
        password: formData.password
      });

      console.log("Success:", response.data);
      alert("Registration Successful! Please Login.");
      navigate("/login"); // Pindah ke halaman login

    } catch (err) {
      console.error("Error:", err);
      
      if (err.response && err.response.data) {
        const data = err.response.data;
        
        // 1. Cek apakah ada error spesifik dari field tertentu
        if (data.email) {
          setError(data.email[0]);
        } else if (data.password) {
          setError("Password: " + data.password[0]); // Kasih tahu kalau ini salah password
        } else if (data.username) {
          setError("Email/Account already exists.");
        } else if (data.detail) {
          setError(data.detail);
        } else {
          // Kalau errornya aneh banget, tampilkan mentahannya
          setError(JSON.stringify(data));
        }
      } else {
        setError("Network Error. Is Django running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logic: Tombol 'Agree & Close' ditekan di Modal
  const handleAgreeFromModal = () => {
    setAgreeTerms(true);
    setShowTerms(false);
  };

  return (
    <>
      {/* 1. CONTAINER: pt-20 (Compact Version - Layout TETAP) */}
      <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-28">
        
        {/* 2. CARD: p-6 md:p-8 (Layout TETAP) */}
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
          
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Join us to find your perfect running shoes.
            </p>
          </div>

          {/* FORM: gap-3 (Layout TETAP) */}
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="email">Email Address</label>
              <input 
                type="email" id="email" value={formData.email} onChange={handleChange} placeholder="runner@example.com" 
                // py-2.5 (Layout TETAP)
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
                required
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="password">Password</label>
              <input 
                type="password" id="password" value={formData.password} onChange={handleChange} placeholder="Create a password" 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
                required
              />
            </div>

            {/* Input Confirm Password */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" 
                className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition bg-slate-50 ${
                  error && !error.includes("Terms") ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                }`}
                required
              />
            </div>

            {/* --- CHECKBOX & TERMS LINK --- */}
            <div className="flex items-start gap-2 mt-1">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreeTerms} 
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 select-none">
                I agree to the{" "}
                <span 
                  onClick={(e) => {
                    e.preventDefault(); 
                    setShowTerms(true);
                  }}
                  className="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800"
                >
                  Terms & Conditions
                </span>
              </label>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            {/* TOMBOL: Update sedikit untuk handle Loading state */}
            <button 
              type="submit" 
              disabled={isLoading} // Matikan tombol saat loading
              className={`mt-2 w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                  isLoading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : (error && !error.includes("Terms") ? "bg-slate-400 cursor-not-allowed" : "bg-[#0a0a5c] hover:bg-blue-900")
              }`}
            >
              {isLoading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-slate-600 mt-4 text-sm">
            Already have an account? 
            <Link to="/login" className="text-blue-600 font-bold ml-1 hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>

      {/* --- MODAL LOGIC --- */}
      {showTerms && (
        <TermsModal 
          onClose={() => setShowTerms(false)} 
          onAccept={handleAgreeFromModal}     
        />
      )}
    </>
  );
}