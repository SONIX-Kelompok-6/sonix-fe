import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom"; // Pastikan Link diimport
import api from "../api/axios";
import { sendInteraction } from "../services/SonixMl";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [shoes, setShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOGIC LENGKAP DENGAN INTEGRASI ML
  const handleAddFavorite = async (shoe) => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId"); // <--- BARU: Ambil User ID untuk ML

    if (!token) {
      setError("Please login first to save this shoe to your favorites.");
      return;
    }

    // --- LOGIC BARU UNTUK ML ---
    // Tentukan value: 
    // Jika sepatu sedang "isFavorite" (True), berarti user mau UNLIKE -> kirim 0
    // Jika sepatu belum "isFavorite" (False), berarti user mau LIKE -> kirim 1
    const interactionValue = shoe.isFavorite ? 0 : 1;
    // ---------------------------

    // 1. Optimistic Update (Ubah UI duluan biar cepet)
    setShoes((prevShoes) =>
      prevShoes.map((s) =>
        s.shoe_id === shoe.shoe_id ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );

    try {
      // 2. Tembak API Backend (Simpan ke Database Django/Supabase)
      await api.post(
        "/api/favorites/toggle/",
        { shoe_id: String(shoe.shoe_id) }, 
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // 3. --- TEMBAK API ML (INTERACT) ---
      // Ini yang bikin feed "You Might Also Like" bekerja
      if (userId) {
          console.log(`[ML] Sending interaction: ${shoe.name}, Value: ${interactionValue}`);
          // Parameter: userId, shoeId, actionType ('like'), value (1 atau 0)
          await sendInteraction(userId, shoe.shoe_id, 'like', interactionValue);
      }
      // -----------------------------------

    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      
      // Kalau gagal, balikin lagi statusnya (Rollback)
      setShoes((prevShoes) =>
        prevShoes.map((s) =>
          s.shoe_id === shoe.shoe_id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      );
      setError("Failed to update favorite status. Please try again.");
    }
  };

  const handleAddCompare = (shoe) => {
    console.log("Add to Compare:", shoe.name);
    // Logic compare nanti lu tambahin di sini
  };

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // AMBIL TOKEN DULU
        const token = localStorage.getItem("userToken");

        const response = await api.get(
          `/api/shoes/search/?q=${query}`,
          {
            // PENTING: Kirim token biar Backend tau mana yang udah dilike
            headers: token ? { Authorization: `Token ${token}` } : {},
          }
        );
        
        // Mapping data biar aman
        const dataWithFavorites = response.data.map(shoe => ({
          ...shoe,
          isFavorite: shoe.isFavorite || false
        }));
        setShoes(dataWithFavorites);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch data from the server. Ensure Django is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-6 pb-12">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Search Results for <span className="text-blue-600">"{query}"</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Showing shoe search results based on the keyword.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {!isLoading && !error && shoes.length === 0 && query && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-700">Shoe not found</h2>
          <p className="text-gray-500">Please try using a different keyword.</p>
        </div>
      )}

      {!isLoading && !error && shoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shoes.map((shoe) => (
            <Link 
              to={`/shoe/${shoe.slug}`} 
              key={shoe.shoe_id} // Pastikan pake shoe_id
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col cursor-pointer"
            >
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-2 group-hover:translate-x-0">
                <button 
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleAddFavorite(shoe);
                  }}
                  className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-colors cursor-pointer ${
                    shoe.isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={shoe.isFavorite ? "Remove from Favorite" : "Add to Favorite"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={shoe.isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
                
                <button 
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleAddCompare(shoe);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Compare"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </button>
              </div>

              <div className="h-56 bg-gray-50 p-6 flex justify-center items-center relative overflow-hidden">
                {/* PASTIKAN INI PAKE image_url (atau img_url sesuai database lu) */}
                <img 
                  src={shoe.image_url || shoe.img_url || "https://via.placeholder.com/300x200?text=No+Image"} 
                  alt={shoe.name} 
                  className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="p-5 flex flex-col flex-grow bg-white">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">{shoe.brand || "Brand"}</p>
                <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-snug">{shoe.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}