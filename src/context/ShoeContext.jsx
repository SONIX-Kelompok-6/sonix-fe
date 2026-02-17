import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

// 1. Bikin Context-nya
const ShoeContext = createContext();

// 2. Bikin Provider (Penyedia Data)
export const ShoeProvider = ({ children }) => {
  // MODIFIKASI 1: Ambil Cache dari LocalStorage (Biar Instant)
  const [allShoes, setAllShoes] = useState(() => {
    try {
      const cached = localStorage.getItem("shoesCache");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  // MODIFIKASI 2: Loading False kalau Cache Ada
  const [isLoading, setIsLoading] = useState(() => {
     return !localStorage.getItem("shoesCache"); 
  });
  
  const [error, setError] = useState(null);

  // FETCH DATA SEKALI SEUMUR HIDUP APLIKASI
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        // Kita fetch semua data di sini
        const response = await api.get("/api/shoes/", {
            headers: token ? { Authorization: `Token ${token}` } : {} 
        });
        
        const data = response.data;
        const results = Array.isArray(data) ? data : (data.results || []);
        
        // Mapping safety buat favorite
        const safeData = results.map(shoe => ({
           ...shoe,
           isFavorite: shoe.isFavorite || false
        }));

        setAllShoes(safeData);
        // MODIFIKASI 3: Update Cache
        localStorage.setItem("shoesCache", JSON.stringify(safeData));
        console.log("✅ Database Synced:", safeData.length, "items");

      } catch (err) {
        console.error("❌ Failed to load database:", err);
        // Kalau cache kosong dan fetch gagal, baru set error
        if (allShoes.length === 0) setError("Failed to load shoes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Dependency kosong = Jalan pas App pertama kali dibuka

  // Fungsi update manual (misal abis nge-like)
  const updateShoeState = (updatedList) => {
    setAllShoes(updatedList);
    // MODIFIKASI 4: Update Cache juga
    localStorage.setItem("shoesCache", JSON.stringify(updatedList));
  };

  return (
    <ShoeContext.Provider value={{ allShoes, isLoading, error, updateShoeState }}>
      {children}
    </ShoeContext.Provider>
  );
};

// 3. Custom Hook biar gampang dipake
export const useShoes = () => useContext(ShoeContext);