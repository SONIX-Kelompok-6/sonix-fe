import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logoImg from '../assets/logo-dark.svg'; 

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // 1. TAMBAHAN SEARCH: State untuk nyimpen ketikan user
  const [searchQuery, setSearchQuery] = useState("");

  const isAuthenticated = !!localStorage.getItem("userToken");

  // 2. TAMBAHAN SEARCH: Fungsi buat nangkep tombol Enter
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery(""); // (Opsional) Kosongin bar pencarian setelah di-enter
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("userToken");

    try {
      if (token) {
        await axios.post('http://localhost:8000/api/logout/', {}, {
          headers: { 'Authorization': `Token ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout backend error:", error);
    } finally {
      localStorage.removeItem("userToken");
      navigate("/login");
      window.location.reload();
    }
  };

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
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center">
            <img 
              src={logoImg}  
              alt="RUSH Logo" 
              className="h-16 w-auto object-contain -my-4 transition-transform group-hover:scale-105" 
            />
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-sm font-semibold text-gray-600 transition hover:text-blue-600 hover:underline hover:underline-offset-4"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search..."
              // 3. TAMBAHAN SEARCH: Sambungin input ke state dan fungsi handleSearch
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-80 rounded-full bg-gray-200/50 py-2 pl-9 pr-4 text-sm font-medium text-gray-700 placeholder-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* DYNAMIC BUTTON (LOGIC LOGOUT/LOGIN) */}
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center justify-center h-10 rounded-full bg-red-600 px-8 text-sm font-bold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg active:scale-95"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="hidden sm:flex items-center justify-center h-10 rounded-full bg-[#0a0a5c] px-8 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 hover:shadow-lg active:scale-95"
            >
              Login
            </Link>
          )}

          {/* HAMBURGER BUTTON */}
          <button 
            className="md:hidden p-2 text-gray-600 transition hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-2 w-full origin-top-right rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-xl border border-white/20 md:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-top-5">
             {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                >
                  {item.name}
                </Link>
              ))}
              <hr className="border-gray-200" />
              
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center rounded-full bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <Link 
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-[#0a0a5c] py-2 text-sm font-bold text-white hover:bg-blue-900"
                >
                  Login
                </Link>
              )}
          </div>
        )}

      </nav>
    </div>
  );
}