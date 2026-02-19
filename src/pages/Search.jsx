import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom"; 
import api from "../api/axios";
import { sendInteraction } from "../services/SonixMl";
import { useShoes } from "../context/ShoeContext"; 

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();

  // AMBIL DATA DARI CONTEXT
  const { allShoes, isLoading: contextLoading, error, updateShoeState } = useShoes(); 

  const [sortBy, setSortBy] = useState("relevance"); 
  
  // 🔥 STATE NOTIFIKASI
  const [notification, setNotification] = useState(null);

  // --- LOGIC TIMER PINTAR (AUTO RESET) ---
  useEffect(() => {
    if (notification) {
      // Set timer untuk hilangkan notif
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      // CLEANUP: Kalau ada notif baru sebelum 3 detik, timer lama DIMATIKAN
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- HELPER ---
  const showNotification = (message) => {
    setNotification(message);
  };

  // --- LOGIC FILTERING & SORTING ---
  const filteredAndSortedShoes = useMemo(() => {
    if (!allShoes) return [];

    let results = [];
    if (query) {
        const lowerQuery = query.toLowerCase();
        results = allShoes.filter((shoe) => {
            const nameMatch = shoe.name && shoe.name.toLowerCase().includes(lowerQuery);
            const brandMatch = shoe.brand && shoe.brand.toLowerCase().includes(lowerQuery);
            return nameMatch || brandMatch;
        });
    }

    const sortedResults = [...results];
    if (sortBy === "lowHigh") {
      sortedResults.sort((a, b) => (Number(a.weight_lab_oz) || 999) - (Number(b.weight_lab_oz) || 999));
    } else if (sortBy === "highLow") {
      sortedResults.sort((a, b) => (Number(b.weight_lab_oz) || 0) - (Number(a.weight_lab_oz) || 0));
    }

    return sortedResults;
  }, [query, allShoes, sortBy]);

  const isLoading = contextLoading;

  // --- HANDLER FAVORITE ---
  const handleAddFavorite = async (shoe) => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId"); 

    // 🔥 CEK LOGIN DULU (TANPA REDIRECT)
    if (!token) {
      showNotification("Please login to save favorites 🔒");
      return; // Stop di sini
    }

    const interactionValue = shoe.isFavorite ? 0 : 1;
    const isNowFavorite = !shoe.isFavorite;

    // UPDATE GLOBAL STATE
    const updatedList = allShoes.map((s) => 
      s.shoe_id === shoe.shoe_id ? { ...s, isFavorite: isNowFavorite } : s
    );
    updateShoeState(updatedList); 
    
    // Show Notification
    showNotification(isNowFavorite ? "Added to Favorites ❤️" : "Removed from Favorites 💔");

    try {
      await api.post("/api/favorites/toggle/", { shoe_id: String(shoe.shoe_id) }, {
        headers: { Authorization: `Token ${token}` },
      });

      if (userId) {
          try { await sendInteraction(userId, shoe.shoe_id, 'like', interactionValue); } catch (mlErr) { console.warn(mlErr); }
      }
    } catch (err) {
      console.error("Failed toggle:", err);
      updateShoeState(allShoes); // Rollback
      showNotification("Failed to update favorite status.");
    }
  };

  // --- ADD TO COMPARE ---
  const handleAddCompare = (shoe) => {
    // 🔥 1. CEK LOGIN DULU (SAMA KAYA FAVORITE)
    const token = localStorage.getItem("userToken");
    if (!token) {
        showNotification("Please login to use comparison 🔒");
        return; // Stop di sini, jangan lanjut ke bawah
    }

    // 2. Logic Compare Biasa
    let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

    // Cek Duplikat
    if (compareList.some((item) => item.shoe_id === shoe.shoe_id)) {
      showNotification(`"${shoe.name}" is already in comparison list!`);
      return;
    }

    // Cek Penuh
    if (compareList.length >= 5) {
      showNotification("Comparison list is full (Max 5).");
      return;
    }

    const shoeToSave = { 
        ...shoe,
        name: shoe.name || shoe.model,
        img_url: shoe.img_url || shoe.mainImage || "https://via.placeholder.com/300x200?text=No+Image",
        slug: shoe.slug 
    };

    compareList.push(shoeToSave);
    localStorage.setItem("compareList", JSON.stringify(compareList));

    // Show Success Notification
    showNotification(`Added "${shoe.name}" to comparison.`);
  };

  // --- RENDER ---
  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 font-sans min-h-screen relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Search Results for <span className="text-blue-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? "Searching..." : `Found ${filteredAndSortedShoes.length} result(s).`}
          </p>
        </div>

        {/* DROPDOWN SORTING */}
        <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Sort By:</span>
             <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all hover:border-gray-300 cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="lowHigh">Weight: Lightest to Heaviest</option>
                  <option value="highLow">Weight: Heaviest to Lightest</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" /></svg>
                </div>
             </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Searching...</span>
        </div>
      )}

      {/* ERROR STATE */}
      {!isLoading && error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && filteredAndSortedShoes.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="text-5xl mb-4 grayscale opacity-20">👟</div>
          <h2 className="text-lg font-bold text-gray-700">Shoe not found</h2>
          <p className="text-gray-500 mb-6">Please try using a different keyword.</p>
          <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-600 font-bold rounded-full hover:bg-gray-100 transition-colors text-xs"
            >
              Back to Home
          </button>
        </div>
      )}

      {/* DATA GRID */}
      {!isLoading && !error && filteredAndSortedShoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedShoes.map((shoe) => (
            <Link 
              to={`/shoe/${shoe.slug}`} 
              key={shoe.shoe_id} 
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
                <img 
                  src={shoe.image_url || shoe.img_url || "https://via.placeholder.com/300x200?text=No+Image"} 
                  alt={shoe.name} 
                  className="max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="p-5 flex flex-col flex-grow bg-white">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">{shoe.brand || "Brand"}</p>
                <h3 className="font-bold text-gray-800 text-base mb-3 line-clamp-2 leading-snug">{shoe.name}</h3>
                
                {/* Weight Indicator */}
                <div className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-400">
                    <span>⚖️ {shoe.weight_lab_oz || "-"} oz</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 🔥 TOAST NOTIFICATION COMPONENT 🔥 */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 transition-all duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <span className="text-sm font-bold">{notification}</span>
      </div>

    </div>
  );
}