import { Routes, Route } from "react-router-dom";

// 1. Import Komponen Tetap (yang muncul di semua halaman)
import Navbar from "./components/Navbar";

// 2. Import Halaman-Halaman (yang isinya ganti-ganti)
import Home from "./pages/Home";
import Recommendation from "./pages/Recommendation";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import CreateProfile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";


export default function App() {
  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      
      {/* Navbar ditaruh di LUAR <Routes> */}
      {/* Artinya: Navbar bakal nempel terus walau halamannya ganti */}
      <Navbar />

      {/* <Routes> adalah area yang isinya berubah sesuai alamat link */}
      <Routes>
        
        {/* Kalau buka website.com/ -> Tampilkan halaman Home */}
        <Route path="/" element={<Home />} />
        
        {/* Kalau buka website.com/login -> Tampilkan halaman Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Kalau buka website.com/recommendation -> Tampilkan halaman Recommendation */}
        <Route path="/recommendation" element={<Recommendation />} />

        <Route path="/register" element={<Register />} />

        <Route path="/create-profile" element={<CreateProfile />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Kalau link ngawur -> Tampilkan 404 */}
        <Route path="*" element={<div className="pt-32 text-center font-bold">404 - Page Not Found</div>} />
        
      </Routes>

    </div>
  );
}

// di bagian import

// di dalam <Routes>
