import React, { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import { sendInteraction } from "../services/SonixMl";
import api from "../api/axios";
import { useShoes } from "../context/ShoeContext"; 

export default function Favorites() {
  const { allShoes, updateShoeState } = useShoes();
  const navigate = useNavigate(); 
  
  // 🔥 STATE BARU: AUTH ERROR
  const [authError, setAuthError] = useState(null);

  // Filter langsung dari Context
  const favorites = allShoes.filter(shoe => shoe.isFavorite === true);

  // --- CEK LOGIN SAAT MOUNT ---
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
        setAuthError("Please login to view your favorite shoes.");
    } else {
        setAuthError(null);
    }
  }, []);

  const handleRemoveFavorite = async (e, shoeId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token) return;

    // Optimistic Update
    const updatedList = allShoes.map(shoe => 
        shoe.shoe_id === shoeId ? { ...shoe, isFavorite: false } : shoe
    );
    updateShoeState(updatedList); 

    try {
      await api.post("/api/favorites/toggle/", { shoe_id: String(shoeId) }, { headers: { Authorization: `Token ${token}` } });
      if (userId) sendInteraction(userId, shoeId, 'like', 0).catch(console.warn);
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      window.location.reload(); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-12 pt-30 min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">My Favorites</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your saved shoes collection.</p>
        </div>
        <div className="text-gray-400 text-sm font-medium">
            {/* Sembunyikan jumlah jika error */}
            {!authError ? `${favorites.length} Items` : "-"}
        </div>
      </div>

      {/* --- 🔥 1. BANNER ERROR (DISISIPKAN DISINI) --- */}
      {authError && (
        <div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>{authError}</span>
        </div>
      )}

      {/* --- KONTEN UTAMA (Dibungkus Div Disabled jika Error) --- */}
      <div className={`transition-all duration-300 ${authError ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
        
        {/* TAMPILKAN EMPTY STATE JIKA KOSONG ATAU ERROR (BELUM LOGIN) */}
        {(favorites.length === 0 || authError) && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] mt-6">
                <div className="w-full max-w-2xl text-center p-10 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                <div className="text-5xl mb-4 grayscale opacity-50">💔</div>
                <h2 className="text-xl font-bold text-gray-700">Your Favorites List is Empty</h2>
                <p className="text-gray-500 mb-6 mt-2">Looks like you haven't saved any shoes yet.</p>
                <Link to="/search" className="px-6 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-lg inline-block">
                    Find Shoes Now
                </Link>
                </div>
            </div>
        )}

        {/* LIST SEPATU (Hanya tampil jika login & ada data) */}
        {!authError && favorites.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((shoe) => {
                const ratingVal = Number(shoe.rating || 0); 
                const hasRating = ratingVal > 0;

                return (
                <div key={shoe.shoe_id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col">
                    <button 
                    onClick={(e) => handleRemoveFavorite(e, shoe.shoe_id)}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all z-20 cursor-pointer"
                    title="Remove from Favorites"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    </button>

                    <Link to={`/shoe/${shoe.slug}`} className="flex flex-col flex-grow h-full">
                    <div className="h-56 bg-gray-50 p-6 flex justify-center items-center relative overflow-hidden">
                        <img src={shoe.img_url || shoe.image_url || "https://via.placeholder.com/300x200?text=No+Image"} alt={shoe.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex flex-col flex-grow bg-white">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">{shoe.brand || "Brand"}</p>
                        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">{shoe.name}</h3>
                        <div className="mt-auto flex items-center gap-1 text-sm font-medium text-gray-500">
                            <svg className={`w-4 h-4 fill-current ${hasRating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span className={hasRating ? "text-gray-700" : "text-gray-400"}>
                            {hasRating ? ratingVal.toFixed(1) : "0.0"}
                            </span>
                        </div>
                    </div>
                    </Link>
                </div>
                );
            })}
            </div>
        )}
      </div>

    </div>
  );
}