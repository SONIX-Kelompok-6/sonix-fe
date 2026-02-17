import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

// 1. Bikin Context-nya
const ShoeContext = createContext();

// 2. Bikin Provider (Penyedia Data)
export const ShoeProvider = ({ children }) => {
  // AMBIL CACHE DARI LOCALSTORAGE BIAR INSTANT LOAD
  const [allShoes, setAllShoes] = useState(() => {
    try {
      const cached = localStorage.getItem("shoesCache");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // LOADING FALSE KALAU CACHE ADA
  const [isLoading, setIsLoading] = useState(() => {
     return !localStorage.getItem("shoesCache"); 
  });
  
  const [error, setError] = useState(null);

  // FETCH DATA COMPLETE (SEPATU + STATUS FAVORIT)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        
        // --- 1. SIAPKAN REQUEST ---
        // Kita butuh list sepatu. Kalau login, kita butuh list favorit juga.
        const promises = [
           api.get("/api/shoes/", { headers: token ? { Authorization: `Token ${token}` } : {} })
        ];

        // Kalau ada token, tambah request ke endpoint favorites
        if (token) {
           promises.push(api.get("/api/favorites/", { headers: { Authorization: `Token ${token}` } }));
        }

        // --- 2. JALANKAN REQUEST ---
        const responses = await Promise.all(promises);
        
        // Ambil Data Sepatu
        const shoesRes = responses[0];
        const shoesData = Array.isArray(shoesRes.data) ? shoesRes.data : (shoesRes.data.results || []);

        // Ambil Data Favorit (Kalau login)
        let favoriteIds = new Set();
        if (token && responses[1]) {
           const favRes = responses[1];
           const favList = Array.isArray(favRes.data) ? favRes.data : [];
           // Masukkan ID sepatu yang difavoritkan ke dalam Set
           favList.forEach(fav => favoriteIds.add(fav.shoe_id));
        }

        // --- 3. MERGING (GABUNG DATA) ---
        // Kita gabungkan data sepatu dengan status favorit dari API
        const mergedData = shoesData.map(shoe => ({
           ...shoe,
           // Cek apakah ID sepatu ini ada di daftar favorit user?
           // Kalau login dan ada di set -> true. Kalau gak -> false.
           isFavorite: favoriteIds.has(shoe.shoe_id)
        }));

        // --- 4. UPDATE STATE & CACHE ---
        setAllShoes(mergedData);
        localStorage.setItem("shoesCache", JSON.stringify(mergedData));
        console.log("✅ Database Synced & Merged:", mergedData.length, "items");

      } catch (err) {
        console.error("❌ Failed to sync database:", err);
        // Kalau error dan cache kosong, baru set error message
        if (allShoes.length === 0) setError("Failed to load shoes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Jalan sekali pas app dibuka/refresh

  // Fungsi update manual
  const updateShoeState = (updatedList) => {
    setAllShoes(updatedList);
    localStorage.setItem("shoesCache", JSON.stringify(updatedList));
  };

  return (
    <ShoeContext.Provider value={{ allShoes, isLoading, error, updateShoeState }}>
      {children}
    </ShoeContext.Provider>
  );
};

// 3. Custom Hook
export const useShoes = () => useContext(ShoeContext);