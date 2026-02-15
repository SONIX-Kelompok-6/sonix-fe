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
import Search from "./pages/Search"; 
import Compare from "./pages/Compare"

export default function App() {
  const location = useLocation();
  const isCustomLayoutPage = location.pathname === "/";
  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      
      <Navbar />

      {/* Main <Routes> pakai tag <main> */}
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
          <Route path="/shoe/:slug" element={<ShoeDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/compare" element={<Compare />} />

          {/* Kalau link ngawur -> Tampilkan 404 */}
          <Route path="*" element={<div className="text-center font-bold">404 - Page Not Found</div>} />
          
        </Routes>
      </main>

      <Footer />
      
    </div>
  );
}