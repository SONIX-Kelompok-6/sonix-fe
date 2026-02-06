import { useState } from "react";
import { Link } from "react-router-dom";
import logoImg from '../assets/logo-dark.png'; 

export default function Navbar() {
  // State untuk buka/tutup menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Recommendation", path: "/recommendation" },
    { name: "Compare", path: "/compare" },
    { name: "Favorite", path: "/favorite" },
    { name: "About", path: "/about" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="relative flex w-full max-w-6xl items-center justify-between rounded-full bg-blue-50/90 px-6 py-3 shadow-lg backdrop-blur-md border border-white/40">
        
        {/* 1. LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center">
            <img 
              src={logoImg}  
              alt="RUSH Logo "
              className="h-16 w-auto object-contain -my-4 transition-transform group-hover:scale-105" 
            />
          </div>
        </Link>

        {/* 2. DESKTOP MENU (Hidden di HP) */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 hover:underline hover:underline-offset-4"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* 3. RIGHT SECTION (Search + Login + Hamburger) */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar (Hidden di Mobile) */}
          <div className="relative hidden lg:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-80 rounded-full bg-slate-200/50 py-2 pl-9 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Link 
            to="/login"
            className="hidden sm:flex items-center justify-center h-10 rounded-full bg-[#0a0a5c] px-8 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 hover:shadow-lg active:scale-95"
          >
            Login
          </Link>

          {/* --- TOMBOL HAMBURGER (Hanya muncul di HP/md:hidden) --- */}
          <button 
            className="md:hidden p-2 text-slate-600 transition hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              // Icon X (Close)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              // Icon Garis 3 (Hamburger)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-full origin-top-right rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-xl border border-white/20 md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-5">
             {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)} // Tutup menu pas diklik
                  className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}
              <hr className="border-gray-200" />
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-[#0a0a5c] py-2 text-sm font-bold text-white hover:bg-blue-900"
              >
                Login
              </Link>
          </div>
        )}

      </nav>
    </div>
  );
}