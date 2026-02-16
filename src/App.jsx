import { Routes, Route, useLocation } from "react-router-dom";

// 1. Import Komponen Tetap
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 2. Import Halaman
import Home from "./pages/Home";
import Recommendation from "./pages/Recommendation";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import About from "./pages/About"; 
import CreateProfile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Favorites from "./pages/Favorites";
import ShoeDetail from "./pages/ShoeDetail";
import Search from "./pages/Search"; 
import Compare from "./pages/Compare";
import Account from "./pages/Account";

export default function App() {
  const location = useLocation();

  // Daftar halaman yang TIDAK boleh ada Navbar & Footer
  const hideNavbarFooterRoutes = [
    "/login", 
    "/register", 
    "/create-profile", 
    "/forgot-password", 
    "/update-password"
  ];

  // Cek apakah lokasi saat ini ada di dalam daftar di atas
  const shouldHideNavbarFooter = hideNavbarFooterRoutes.includes(location.pathname);

  // Logic lama untuk padding (tetap dipertahankan, tapi disesuaikan sedikit)
  const isCustomLayoutPage = location.pathname === "/";

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      
      {/* 2. PERUBAHAN: Render Navbar HANYA jika shouldHideNavbarFooter bernilai false */}
      {!shouldHideNavbarFooter && <Navbar />}

      {/* Main Content*/}
      <main className={`flex-grow ${isCustomLayoutPage || shouldHideNavbarFooter ? "pt-0" : "pt-24"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/search" element={<Search />} />
          <Route path="/shoe/:slug" element={<ShoeDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<div className="text-center font-bold mt-10">404 - Page Not Found</div>} />
        </Routes>
      </main>

      {/* 3. PERUBAHAN: Render Footer HANYA jika shouldHideNavbarFooter bernilai false */}
      {!shouldHideNavbarFooter && <Footer />}
      
    </div>
  );
} 