import { Routes, Route, useLocation } from "react-router-dom";

// 1. Import Komponen Tetap (yang muncul di semua halaman)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 2. Import Halaman-Halaman (yang isinya ganti-ganti)
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
// TAMBAHAN 1: Import halaman Search
import Search from "./pages/Search"; 

export default function App() {
  const location = useLocation();
  const isCustomLayoutPage = location.pathname === "/";
  return (
    // PERUBAHAN 1: Tambah 'flex flex-col' di div paling luar
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      
      {/* Navbar ditaruh di LUAR <Routes> */}
      <Navbar />

      {/* PERUBAHAN 2: Bungkus <Routes> pakai tag <main> dan kasih 'flex-grow pt-28' */}
      <main className={`flex-grow ${isCustomLayoutPage ? "pt-22" : "pt-28"}`}>
        <Routes>
          
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/favorites" element={<Favorites />} />
          
          {/* TAMBAHAN 2: Daftarin rute /search */}
          <Route path="/search" element={<Search />} />
          <Route path="/shoe/:slug" element={<ShoeDetail />} />

          {/* Kalau link ngawur -> Tampilkan 404 */}
          <Route path="*" element={<div className="text-center font-bold">404 - Page Not Found</div>} />
          
        </Routes>
      </main>

      {/* Footer sekarang bakal nurut di bawah */}
      <Footer />
      
    </div>
  );
}