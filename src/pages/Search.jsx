import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Search() {
  // 1. Tangkap kata kunci 'q' dari URL (misal: /search?q=nike)
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  // 2. State untuk nyimpen data
  const [shoes, setShoes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 3. Fungsi buat nembak API Django tiap kali 'query' berubah
  useEffect(() => {
    // Kalau URL-nya kosong (cuma /search doang), gak usah nembak API
    if (!query) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // NEMBAK API DJANGO (Pastikan port backend lu bener 8000)
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
          Menampilkan hasil pencarian sepatu berdasarkan kata kunci.
        </p>
      </div>

      {/* KONDISI 1: Lagi Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* KONDISI 2: Ada Error (Misal Django mati) */}
      {!isLoading && error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      {/* KONDISI 3: Data Kosong / Gak Ketemu */}
      {!isLoading && !error && shoes.length === 0 && query && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-700">Sepatu tidak ditemukan</h2>
          <p className="text-gray-500">Coba gunakan kata kunci lain, ya.</p>
        </div>
      )}

      {/* KONDISI 4: Data Ketemu (Tampilin Grid Sepatu) */}
      {!isLoading && !error && shoes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {shoes.map((shoe) => (
            <div key={shoe.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
              {/* Gambar Sepatu */}
              <div className="h-48 bg-gray-100 p-4 flex justify-center items-center">
                <img 
                  src={shoe.image_url || "https://via.placeholder.com/300x200?text=No+Image"} 
                  alt={shoe.name} 
                  className="max-h-full object-contain mix-blend-multiply"
                />
              </div>
              
              {/* Info Sepatu */}
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{shoe.brand || "Brand"}</p>
                <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{shoe.name}</h3>
                <div className="mt-auto">
                  <p className="text-blue-600 font-extrabold">Rp {shoe.price?.toLocaleString('id-ID') || "0"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}