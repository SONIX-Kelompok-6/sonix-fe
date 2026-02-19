import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";

const ShoeContext = createContext();

export const ShoeProvider = ({ children }) => {
  const [allShoes, setAllShoes] = useState(() => {
    try {
      const cached = localStorage.getItem("shoesCache");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(() => !localStorage.getItem("shoesCache"));
  const [error, setError] = useState(null);

  // 1. Kita bungkus fetch logic ke dalam useCallback agar fungsinya stabil 
  // dan bisa kita panggil ulang kapan saja (misal: setelah login/logout)
  const refreshShoes = useCallback(async () => {
    // Optional: Aktifkan loading tiap kali refresh data
    setIsLoading(true); 
    try {
      const token = localStorage.getItem("userToken");
      
      const promises = [
         api.get("/api/shoes/") 
      ];

      // Jika ada token (user sudah login), tarik juga data favoritnya
      if (token) {
         promises.push(api.get("/api/favorites/", { headers: { Authorization: `Token ${token}` } }));
      }

      const responses = await Promise.all(promises);
      
      const shoesRes = responses[0];
      const shoesData = Array.isArray(shoesRes.data) ? shoesRes.data : (shoesRes.data.results || []);

      let favoriteIds = new Set();
      if (token && responses[1]) {
         const favRes = responses[1];
         const favList = Array.isArray(favRes.data) ? favRes.data : [];
         favList.forEach(fav => favoriteIds.add(fav.shoe_id));
      }

      // Merge Data
      const mergedData = shoesData.map(shoe => ({
         ...shoe,
         isFavorite: favoriteIds.has(shoe.shoe_id)
      }));

      setAllShoes(mergedData);
      localStorage.setItem("shoesCache", JSON.stringify(mergedData));
      console.log("✅ Database Synced with Ratings:", mergedData.length, "items");

    } catch (err) {
      console.error("❌ Failed to sync database:", err);
      setError("Failed to load shoes.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependency kosong karena kita selalu baca fresh token dari localStorage

  // 2. Panggil otomatis saat aplikasi pertama kali dibuka
  useEffect(() => {
    refreshShoes();
  }, [refreshShoes]); 

  const updateShoeState = (updatedList) => {
    setAllShoes(updatedList);
    localStorage.setItem("shoesCache", JSON.stringify(updatedList));
  };

  return (
    // 3. Lempar `refreshShoes` ke dalam Provider agar komponen lain (seperti Login) bisa memanggilnya
    <ShoeContext.Provider value={{ allShoes, isLoading, error, updateShoeState, refreshShoes }}>
      {children}
    </ShoeContext.Provider>
  );
};

export const useShoes = () => useContext(ShoeContext);