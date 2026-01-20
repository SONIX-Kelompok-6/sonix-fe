import { useState } from "react";
import { Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Please make sure passwords match.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions to register.");
      return;
    }
    console.log("Register Data:", formData);
    alert("Registrasi Berhasil!");
  };

  // Logic: Tombol 'Agree & Close' ditekan di Modal
  const handleAgreeFromModal = () => {
    setAgreeTerms(true);
    setShowTerms(false);
  };

  return (
    <>
      {/* 1. CONTAINER: pt-20 (Compact Version agar muat 1 layar) */}
      <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-20">
        
        {/* 2. CARD: p-6 md:p-8 (Padding lebih rapat) */}
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
          
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Join us to find your perfect running shoes.
            </p>
          </div>

          {/* FORM: gap-3 (Jarak rapat agar pendek) */}
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            
            {/* Input Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-sm" htmlFor="email">Email Address</label>
              <input 
                type="email" id="email" value={formData.email} onChange={handleChange} placeholder="runner@example.com" 
                // py-2.5 (Lebih tipis)
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
                    e.preventDefault(); // <-- PENTING: Mencegah checkbox berubah saat klik tulisan
                    setShowTerms(true);
                  }}
                  className="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800"
                >
                  Terms & Conditions
                </span>
              </label>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button 
              type="submit" 
              className={`mt-2 w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                  error && !error.includes("Terms") ? "bg-slate-400 cursor-not-allowed" : "bg-[#0a0a5c] hover:bg-blue-900"
              }`}
            >
              Sign Up
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
          onClose={() => setShowTerms(false)} // Tombol X: Cuma tutup
          onAccept={handleAgreeFromModal}     // Tombol Agree: Tutup + Centang
        />
      )}
    </>
  );
}