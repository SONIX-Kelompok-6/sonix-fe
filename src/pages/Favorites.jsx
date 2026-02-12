import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Ambil data favorit pas halaman dibuka
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Lu harus login dulu buat liat favorit.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/favorites/", {
          headers: { Authorization: `Token ${token}` },
        });
        setFavorites(response.data);
      } catch (err) {
        console.error("Gagal ambil favorit", err);
        setError("Gagal mengambil daftar favorit dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // 2. Fungsi buat hapus dari favorit
  const handleRemoveFavorite = async (shoeId) => {
    const token = localStorage.getItem("userToken");
    try {
      await axios.post(
        "http://localhost:8000/api/favorites/toggle/",
        { shoe_id: String(shoeId) },
        { headers: { Authorization: `Token ${token}` } }
      );

      // Langsung hilangkan sepatu dari layar tanpa perlu refresh
      setFavorites((prev) => prev.filter((shoe) => shoe.shoe_id !== shoeId));
      alert("Berhasil dihapus dari favorit!");
    } catch (err) {
      alert("Gagal menghapus favorit.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-12 pt-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          My Favorites
        </h1>
      </div>

      {/* KONDISI 1: Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}

      {/* KONDISI 2: Error / Belum Login */}
      {!isLoading && error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {/* KONDISI 3: Kosong (Belum ada favorit) */}
      {!isLoading && !error && favorites.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="text-4xl mb-4">💔</div>
          <h2 className="text-lg font-bold text-gray-700">Your Favorites List is Empty</h2>
          <p className="text-gray-500 mb-6">You haven't added any shoes to your favorites yet.</p>
          <Link 
            to="/search?q=" 
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Searching for Shoes
          </Link>
        </div>
      )}

      {/* KONDISI 4: Ada Data */}
      {!isLoading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((shoe) => (
            <div 
              key={shoe.shoe_id} 
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col"
            >
              
              {/* TOMBOL HAPUS (TRASH) */}
              <button 
                onClick={() => handleRemoveFavorite(shoe.shoe_id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-red-500 hover:bg-red-500 hover:text-white transition-colors z-10"
                title="Hapus dari Favorit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>

              {/* Gambar */}
              <div className="h-56 bg-gray-50 p-6 flex justify-center items-center relative overflow-hidden">
                <img 
                  src={shoe.image_url || "https://via.placeholder.com/300x200?text=No+Image"} 
                  alt={shoe.name} 
                  className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Info */}
              <div className="p-5 flex flex-col flex-grow bg-white">
                <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">{shoe.brand || "Brand"}</p>
                <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-snug">{shoe.name}</h3>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}