// src/context/ShoeContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

// 1. Bikin Context-nya
const ShoeContext = createContext();

// 2. Bikin Provider (Penyedia Data)
export const ShoeProvider = ({ children }) => {
  const [allShoes, setAllShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.log("✅ Database Loaded in Background:", safeData.length, "items");

      } catch (err) {
        console.error("❌ Failed to load database:", err);
        setError("Failed to load shoes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Dependency kosong = Jalan pas App pertama kali dibuka

  // Fungsi update manual (misal abis nge-like)
  const updateShoeState = (updatedList) => {
    setAllShoes(updatedList);
  };

  return (
    <ShoeContext.Provider value={{ allShoes, isLoading, error, updateShoeState }}>
      {children}
    </ShoeContext.Provider>
  );
};

// 3. Custom Hook biar gampang dipake
export const useShoes = () => useContext(ShoeContext);