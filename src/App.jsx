import { Routes, Route } from "react-router-dom";


// 1. Import Komponen Tetap (yang muncul di semua halaman)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// 2. Import Halaman-Halaman (yang isinya ganti-ganti)
// Pastikan file-file ini sudah kamu buat di folder src/pages/ ya!
import Home from "./pages/Home";
import Recommendation from "./pages/Recommendation";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import CreateProfile from "./pages/CreateProfile";
import Compare from "./pages/Compare";
import Favorite from "./pages/Favorite";
import About from "./pages/About";  


export default function App() {
  
  return (
    <div className="bg-gradient-to-b from-sky-100 to-blue-200 min-h-screen pt-24flex flex-col"> 
      {/* Navbar ditaruh di LUAR <Routes> */}
      {/* Artinya: Navbar bakal nempel terus walau halamannya ganti */}
      <Navbar />

      {/* <Routes> adalah area yang isinya berubah sesuai alamat link */}
      <main className="flex-grow">
        <Routes>
          
          {/* Kalau buka website.com/ -> Tampilkan halaman Home */}
          <Route path="/" element={<Home />} />
          
          {/* Kalau buka website.com/login -> Tampilkan halaman Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Kalau buka website.com/recommendation -> Tampilkan halaman Recommendation */}
          <Route path="/recommendation" element={<Recommendation />} />

          <Route path="/compare" element={<Compare />} />

          <Route path="/favorite" element={<Favorite />} />

          <Route path="/about" element={<About />} />

          <Route path="/register" element={<Register />} />

          <Route path="/create-profile" element={<CreateProfile />} />

          {/* Kalau link ngawur -> Tampilkan 404 */}
          <Route path="*" element={<div className="pt-32 text-center font-bold">404 - Page Not Found</div>} />
          
        </Routes>
      </main>
    </div>
  );
}