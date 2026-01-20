import { Link } from "react-router-dom";

export default function Login() {
  return (
    // 1. Container Utama:
    // - min-h-screen: Agar tingginya minimal setinggi layar.
    // - flex items-center justify-center: Jurus sakti buat naruh konten persis di TENGAH.
    // - bg-[#f5f5f7]: Warna background abu-abu sangat muda (biar kotak putihnya menonjol).
    <div className="min-h-screen flex items-start justify-center bg-[#f5f5f7] px-4 pt-28">
      
      {/* 2. Kartu Login (Kotak Putih):
         - w-full max-w-md: Lebarnya nyesuain layar, tapi mentok di ukuran 'medium' (biar ga kepanjangan).
         - bg-white: Warna dasar putih.
         - rounded-2xl: Sudutnya melengkung halus.
         - shadow-xl: Ada bayangan biar kesan melayang.
         - p-8: Padding dalam yang lega.
      */}
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Judul */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Login</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Enter your details to access your account.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">
          
          {/* Input Email */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="email">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              placeholder="runner@example.com" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-sm" htmlFor="password">
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-slate-50"
            />
            <div className="text-right mt-2">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Tombol Sign In */}
          <button 
            type="submit" 
            className="mt-2 w-full bg-[#0a0a5c] text-white font-bold py-3.5 rounded-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Link Sign Up */}
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