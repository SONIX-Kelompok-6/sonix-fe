import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Tambah useNavigate
import axios from "axios"; // Tambah axios

export default function Login() {
  const navigate = useNavigate(); // Hook untuk redirect

  // 1. STATE (Penyimpan Data Sementara)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState(""); // Untuk pesan error merah
  const [isLoading, setIsLoading] = useState(false); // Untuk loading button

  // 2. HANDLER: Saat ngetik di form
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 3. HANDLER: Saat tombol Sign In ditekan
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

      // Sukses
      console.log("Login Success:", response.data);
      localStorage.setItem("userEmail", response.data.email); // Simpan sesi simpel
      alert("Login Successful! Welcome back.");
      navigate("/"); // Pindah ke Home

    } catch (err) {
      // Gagal
      console.error("Login Error:", err);
      if (err.response && err.response.data) {
        // Ambil error dari Django (biasanya key 'error')
        setError(err.response.data.error || "Invalid email or password.");
      } else {
        setError("Network Error. Is Django running?");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Container Utama (TIDAK BERUBAH)
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-28">
      
      {/* 2. Kartu Login (TIDAK BERUBAH) */}
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Judul (TIDAK BERUBAH) */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Login</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your details to access your account.
          </p>
        </div>

        {/* Form (Ditambah onSubmit) */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          
          {/* Input Email (Ditambah value & onChange) */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="email">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              value={formData.email} // Logic
              onChange={handleChange} // Logic
              placeholder="runner@example.com" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
              required // Logic
            />
          </div>

          {/* Input Password (Ditambah value & onChange) */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="password">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              value={formData.password} // Logic
              onChange={handleChange} // Logic
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
              required // Logic
            />
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Error Message (Hanya muncul jika ada error) */}
          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded-lg border border-red-100">
                {error}
            </div>
          )}

          {/* Tombol Sign In (Ditambah Logic Loading) */}
          <button 
            type="submit" 
            disabled={isLoading} // Matikan tombol saat loading
            className={`mt-2 w-full text-white font-bold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl cursor-pointer ${
                isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#0a0a5c] hover:bg-blue-900"
            }`}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        {/* Link Sign Up (TIDAK BERUBAH) */}
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