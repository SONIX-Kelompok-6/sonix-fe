import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [shoes, setShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- TAMBAHAN BARU: State buat nyimpen ID sepatu yang udah di-favorit ---
  const [favoriteIds, setFavoriteIds] = useState([]);

  // --- TAMBAHAN BARU: Tarik data favorit pas komponen dibuka biar hatinya sesuai ---
  useEffect(() => {
    const fetchFavoriteIds = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return; // Kalau belum login, skip aja

      try {
        const response = await axios.get("http://localhost:8000/api/favorites/", {
          headers: { Authorization: `Token ${token}` },
        });
        // Ambil array yang isinya cuma shoe_id doang
        const ids = response.data.map((item) => item.shoe_id);
        setFavoriteIds(ids);
      } catch (err) {
        console.error("Gagal mengambil data favorit awal:", err);
      }
    };

    fetchFavoriteIds();
  }, []); // Jalan sekali pas awal aja

  // --- LOGIKA FAVORITE & COMPARE ---
  const handleAddFavorite = async (shoe) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      alert("Lu harus login dulu, Bro!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/favorites/toggle/",
        { 
          shoe_id: String(shoe.shoe_id) 
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // --- TAMBAHAN BARU: Update warna hati tanpa perlu refresh page ---
      if (response.data.is_favorite) {
        // Kalau nambah favorit, masukin ID-nya ke array
        setFavoriteIds((prev) => [...prev, shoe.shoe_id]);
      } else {
        // Kalau batal favorit, hapus ID-nya dari array
        setFavoriteIds((prev) => prev.filter((id) => id !== shoe.shoe_id));
      }

      console.log(response.data.message); // Biar terminal bersih, alert gua ganti console.log aja ya biar ga ganggu UI
    } catch (error) {
      console.error("Gagal update favorite:", error);
      alert(error.response?.data?.error || "Gagal memproses favorit.");
    }
  };

  const handleAddCompare = (shoe) => {
    const existingCompare = JSON.parse(localStorage.getItem("compare_shoes") || "[]");
    
    if (existingCompare.find((item) => item.shoe_id === shoe.shoe_id)) {
      alert("Sepatu ini udah masuk daftar banding!");
      return;
    }

    if (existingCompare.length >= 4) {
      alert("Maksimal bandingin 4 sepatu ya.");
      return;
    }

    const newCompare = [...existingCompare, shoe];
    localStorage.setItem("compare_shoes", JSON.stringify(newCompare));
    alert(`${shoe.name} ditambah ke daftar banding!`);
  };

  // 3. Fungsi buat nembak API Django tiap kali 'query' berubah
  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:8000/api/shoes/search/?q=${query}`);
        setShoes(response.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Gagal mengambil data dari server. Pastikan Django sudah jalan.");
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
          Show all shoes matching your search.
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
          <h2 className="text-lg font-bold text-gray-700">No Shoes Found</h2>
          <p className="text-gray-500">Try using different keywords.</p>
        </div>
      )}

      {!isLoading && !error && shoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shoes.map((shoe) => (
            <div 
              key={shoe.shoe_id} 
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col cursor-pointer"
            >
              
              {/* TOMBOL MELAYANG */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-2 group-hover:translate-x-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddFavorite(shoe);
                  }}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-gray-400 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Toggle Favorite"
                >
                  {/* --- TAMBAHAN BARU: Logic ganti warna icon hati --- */}
                  {favoriteIds.includes(shoe.shoe_id) ? (
                    // Hati Terisi (Merah Solid)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                    </svg>
                  ) : (
                    // Hati Kosong (Outline biasa)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 hover:text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  )}
                </button>
                
                <button 
                  onClick={(e) => {
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
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">{shoe.brand || "Brand"}</p>
                <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-snug">{shoe.name}</h3>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}