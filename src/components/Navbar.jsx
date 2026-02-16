import { useState, useEffect, useRef } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import logoImg from '../assets/logo-dark.svg'; 

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const isAuthenticated = !!localStorage.getItem("userToken");

  // 1. STATE BARU: Untuk menyimpan username yang sedang login
  const [username, setUsername] = useState("");

  // 2. USE EFFECT BARU: Fetch data user saat Navbar dimuat
useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("userToken");
    
    if (token) {
      try {
        // GANTI INI: Pakai endpoint profile, JANGAN pakai /api/login/
        const response = await api.get("/api/user-profile/"); 
        
        // Ambil username dari data profile
        setUsername(response.data.username);
      } catch (error) {
        console.error("Gagal ambil data user di Navbar:", error);
      }
    }
  };

  fetchUserData();
}, [isAuthenticated]);

  // 3. LOGIC GAMBAR PROFILE (Dinamis)
  // Kalau username ada (misal: "Sonic"), pakai API ui-avatars buat bikin gambar huruf "S"
  // Kalau username kosong, pakai gambar dummy
  const userImage = `https://ui-avatars.com/api/?name=${username}&background=0D8ABC&color=fff&bold=true`; 

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery(""); 
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("userToken");
    try {
      if (token) {
        await api.post("/api/logout/", {}, {
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Recommendation", path: "/recommendation" },
    { name: "Compare", path: "/compare" },
    { name: "Favorites", path: "/favorites" },
    { name: "About", path: "/about" },
  ];

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="absolute top-0 w-full max-w-6xl z-50 flex items-center justify-between rounded-full bg-blue-50/90 px-6 py-3 shadow-lg backdrop-blur-md border border-white/40">
        
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-64 xl:w-80 rounded-full bg-gray-200/50 py-2 pl-9 pr-4 text-sm font-medium text-gray-700 placeholder-gray-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* DYNAMIC BUTTON (PROFILE / LOGIN) */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              {/* Avatar Button */}
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-600 overflow-hidden transition hover:shadow-md focus:outline-none"
              >
                <img 
                  src={userImage} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 origin-top-right bg-[#1e2a4a] rounded-xl shadow-xl border border-blue-800/50 text-white animate-in fade-in slide-in-from-top-2">
                  <div className="absolute -top-1 right-3 w-3 h-3 bg-[#1e2a4a] rotate-45 border-l border-t border-blue-800/50"></div>
                  
                  <div className="flex flex-col py-2">
                    
                    {/* 4. TAMBAHAN: Nama User di Dropdown */}
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-600 mb-1">
                      Hi, {username || "Runner"}
                    </div>

                    <Link 
                      to="/account" 
                      className="px-4 py-2 text-sm font-medium hover:bg-blue-800 transition text-center"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Account
                    </Link>
                    
                    <div className="h-px bg-gray-600/50 mx-4 my-1"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium hover:bg-blue-800 transition text-center text-red-300 hover:text-red-200"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login"
              className="hidden sm:flex items-center justify-center h-10 rounded-full bg-[#0a0a5c] px-8 text-sm font-bold text-white shadow-md transition hover:bg-blue-900 hover:shadow-lg active:scale-95"
            >
              Login
            </Link>
          )}

          {/* HAMBURGER BUTTON (Mobile) */}
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
                <>
                  <Link 
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-full bg-gray-100 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 mb-2"
                  >
                    Account ({username})
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center rounded-full bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
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