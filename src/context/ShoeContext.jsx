import { createContext, useState, useEffect, useContext } from "react";
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        
        const promises = [
           api.get("/api/shoes/") // Endpoint ini sekarang SUDAH ADA RATINGNYA
        ];

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
           // Rating otomatis diambil dari 'shoe.rating' (dari backend)
           // Kita cuma perlu tempel isFavorite
           isFavorite: favoriteIds.has(shoe.shoe_id)
        }));

        setAllShoes(mergedData);
        localStorage.setItem("shoesCache", JSON.stringify(mergedData));
        console.log("✅ Database Synced with Ratings:", mergedData.length, "items");

      } catch (err) {
        console.error("❌ Failed to sync database:", err);
        if (allShoes.length === 0) setError("Failed to load shoes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); 

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

export const useShoes = () => useContext(ShoeContext);