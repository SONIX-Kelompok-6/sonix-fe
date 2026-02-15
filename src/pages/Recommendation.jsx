import React, { useState, useMemo, useEffect } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

// --- IMPORT ASSETS (Pastikan path sesuai struktur foldermu) ---
import roadImg from "../assets/recommendation-page/road.png";
import trailImg from "../assets/recommendation-page/trail.png";
import imgNarrow from '../assets/profile-images/foot-narrow.svg';
import imgRegular from '../assets/profile-images/foot-regular.svg';
import imgWide from '../assets/profile-images/foot-wide.svg';
import imgFlat from '../assets/profile-images/arch-flat.svg';
import imgNormal from '../assets/profile-images/arch-normal.svg';
import imgHigh from '../assets/profile-images/arch-high.svg';

// --- DATA DUMMY (Fallback jika Backend mati/kosong) ---
const MOCK_SHOES = [
  { id: 1, name: "Nike Winflo 10", brand: "Nike", weight: 280, rating: 4.9, img: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/56c64601-5735-4340-9e73-0402fb0c9043/winflo-10-road-running-shoes-55K0qf.png" },
  { id: 2, name: "Saucony Ride 16", brand: "Saucony", weight: 250, rating: 4.8, img: "https://s7d4.scene7.com/is/image/WolverineWorldWide/S20830-85_1?wid=800&hei=640&fmt=jpeg&qlt=80,0&op_sharpen=0&resMode=sharp2&op_usm=0.5,1.0,8,0&iccEmbed=0&printRes=72" },
  { id: 3, name: "ASICS Dynablast 3", brand: "ASICS", weight: 258, rating: 4.9, img: "https://images.asics.com/is/image/asics/1011B460_402_SR_RT_GLB?$zoom$" },
  { id: 4, name: "Brooks Ghost 15", brand: "Brooks", weight: 286, rating: 4.7, img: "https://www.brooksrunning.com/on/demandware.static/-/Sites-brooks-master-catalog/default/dw204f4705/original/110393/110393-020-l-ghost-15-mens-neutral-cushion-running-shoe.png" },
  { id: 5, name: "HOKA Clifton 9", brand: "HOKA", weight: 248, rating: 4.6, img: "https://www.hoka.com/on/demandware.static/-/Sites-HOKA-US-master/default/dw27768565/images/primary/1127895-BBLC_1.jpg" },
  { id: 6, name: "Nike Pegasus 40", brand: "Nike", weight: 275, rating: 4.9, img: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a0c4f107-c75c-4235-950e-55248270c53d/pegasus-40-road-running-shoes-TCcnd9.png" },
];

const BRANDS_LIST = ["ASICS", "Nike", "New Balance", "Adidas", "Saucony", "HOKA", "Brooks", "On", "PUMA", "Altra", "Mizuno", "Salomon", "Under Armour", "Skechers", "Reebok", "Merrell", "Topo Athletic"];

export default function Recommendation() {
  const [step, setStep] = useState("menu"); 
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- STATE DATA ---
  const [searchResults, setSearchResults] = useState([]); // Menampung hasil API
  const [favoriteIds, setFavoriteIds] = useState([]); 

  // 1. STATE FISIK (SHARED)
  const [commonData, setCommonData] = useState({
    footWidth: null,
    archType: null, 
    orthotics: null, 
  });

  // 2. STATE KHUSUS ROAD
  const [roadData, setRoadData] = useState({
    purpose: null, pace: null, cushion: null, season: null, stability: null, strike: null,
  });

  // 3. STATE KHUSUS TRAIL
  const [trailData, setTrailData] = useState({
    terrain: null, pace: null, season: null, strike: null, waterResistant: null, rockSensitivity: null,
  });

  // State Filter UI
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");

  // --- FETCH USE MY PROFILE ---
  const handleUseProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) { alert("Please login first."); return; }
    setProfileLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/profile/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = response.data; 
      let mappedArch = null;
      if (data.arch_type === "Flat") mappedArch = "Flat Arch";
      else if (data.arch_type === "Normal") mappedArch = "Normal Arch";
      else if (data.arch_type === "High") mappedArch = "High Arch";

      setCommonData({
        footWidth: data.foot_width, 
        archType: mappedArch,
        orthotics: data.uses_orthotics ? "Yes" : "No"
      });
    } catch (err) { console.error("Gagal load profile", err); } finally { setProfileLoading(false); }
  };

  // --- FETCH FAVORITES (INIT) ---
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      try {
        // Ambil list sepatu yang sudah di-favorite oleh user
        const response = await axios.get("http://localhost:8000/api/favorites/", {
          headers: { Authorization: `Token ${token}` },
        });

        // Backend mengembalikan array object sepatu lengkap.
        // Kita ambil "shoe_id" nya saja untuk disimpan di state favoriteIds.
        // Pastikan backend mengirim field 'shoe_id' (string)
        const ids = response.data.map(item => item.shoe_id);
        setFavoriteIds(ids);
      } catch (err) {
        console.error("Gagal load favorites", err);
      }
    };
    fetchUserFavorites();
  }, []);

  const handleToggleSelect = (category, value) => {
    const commonKeys = ['footWidth', 'archType', 'orthotics'];
    if (commonKeys.includes(category)) {
      setCommonData(prev => ({...prev, [category]: prev[category] === value ? null : value}));
    } else {
      if (step === "road") setRoadData(prev => ({...prev, [category]: prev[category] === value ? null : value}));
      else if (step === "trail") setTrailData(prev => ({...prev, [category]: prev[category] === value ? null : value}));
    }
  };

  const getCurrentValue = (category) => {
    if (['footWidth', 'archType', 'orthotics'].includes(category)) return commonData[category];
    if (step === "road") return roadData[category];
    if (step === "trail") return trailData[category];
    return null;
  };

  const isFormValid = () => {
    const baseValid = commonData.footWidth && commonData.archType && commonData.orthotics;
    if (step === "road") return baseValid && roadData.purpose;
    if (step === "trail") return baseValid && trailData.terrain;
    return false;
  };

  // --- FUNGSI FIND SHOES (BACKEND CONNECTED) ---
  const handleFind = async () => {
    setLoading(true);

    const cleanArch = commonData.archType ? commonData.archType.replace(" Arch", "") : null;
    let cleanWater = trailData.waterResistant;
    if (cleanWater === "Water Proof") cleanWater = "Waterproof";

    let payload = {};
    let endpoint = "";

    if (step === "road") {
        endpoint = "http://localhost:8000/api/recommendations/road/";
        payload = {
            running_purpose: roadData.purpose,
            pace: roadData.pace,
            orthotic_usage: commonData.orthotics,
            arch_type: cleanArch,
            strike_pattern: roadData.strike,
            cushion_preferences: roadData.cushion,
            foot_width: commonData.footWidth,
            stability_need: roadData.stability,
            season: roadData.season
        };
    } else if (step === "trail") {
        endpoint = "http://localhost:8000/api/recommendations/trail/";
        payload = {
            terrain: trailData.terrain,
            rock_sensitive: trailData.rockSensitivity,
            pace: trailData.pace,
            orthotic_usage: commonData.orthotics,
            arch_type: cleanArch,
            strike_pattern: trailData.strike,
            foot_width: commonData.footWidth,
            season: trailData.season,
            water_resistance: cleanWater
        };
    }

    console.log(`POST to ${endpoint}`, payload);

    try {
        const token = localStorage.getItem("userToken");
        const response = await axios.post(endpoint, payload, {
           headers: token ? { Authorization: `Token ${token}` } : {}
        });

        // Simpan hasil pencarian asli
        if (Array.isArray(response.data)) {
            setSearchResults(response.data);
        } else if (response.data.results) {
            setSearchResults(response.data.results);
        } else {
            setSearchResults([]); 
        }
        setStep("results");

    } catch (err) {
        console.error("Error finding shoes:", err);
        alert("Gagal mendapatkan rekomendasi. Menggunakan data simulasi.");
        setSearchResults([]); // Kosongkan atau bisa isi MOCK_SHOES jika mau mode offline
        setStep("results");
    } finally {
        setLoading(false);
    }
  };

  // --- LOGIC ADD FAVORITE ---
  const handleAddFavorite = async (shoeId) => {
    const token = localStorage.getItem("userToken");
    
    // 1. Validasi Login
    if (!token) { 
      alert("Please login first to save this shoe."); 
      return; 
    }

    // Pastikan ID berupa string (karena di database tipe-nya Text/Varchar)
    const idString = String(shoeId);

    // 2. Cek status saat ini (lagi di-love atau tidak?)
    const isCurrentlyFavorite = favoriteIds.includes(idString);

    // 3. OPTIMISTIC UPDATE (Ubah warna duluan biar cepat)
    setFavoriteIds((prevIds) => 
      isCurrentlyFavorite 
        ? prevIds.filter(id => id !== idString) // Kalau udah ada, hapus (jadi putih)
        : [...prevIds, idString] // Kalau belum ada, tambah (jadi merah)
    );

    try {
      // 4. Request ke Backend
      await axios.post(
        "http://localhost:8000/api/favorites/toggle/", 
        { shoe_id: idString }, 
        { headers: { Authorization: `Token ${token}` } }
      );
      // Sukses! Tidak perlu update state lagi karena sudah di langkah 3.
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      
      // 5. ROLLBACK (Kalau API error, balikin warnanya)
      setFavoriteIds((prevIds) => 
        isCurrentlyFavorite 
          ? [...prevIds, idString] // Balikin jadi merah
          : prevIds.filter(id => id !== idString) // Balikin jadi putih
      );
      alert("Gagal menyimpan. Cek koneksi internet.");
    }
  };

  // --- LOGIC DISPLAY (FILTER & SORT) ---
  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    else setSelectedBrands([...selectedBrands, brand]);
  };

  // Logic: Gunakan searchResults (API) jika ada, jika kosong pake MOCK_SHOES (sebagai fallback/demo)
  const sourceData = searchResults.length > 0 ? searchResults : MOCK_SHOES; 

  const featuredShoe = sourceData[0]; 
  const availableListShoes = sourceData.slice(1);

  const filteredListShoes = useMemo(() => {
    let result = availableListShoes;
    if (selectedBrands.length > 0) result = result.filter(shoe => selectedBrands.includes(shoe.brand));
    if (sortBy === "lowHigh") result = [...result].sort((a, b) => a.weight - b.weight);
    else if (sortBy === "highLow") result = [...result].sort((a, b) => b.weight - a.weight);
    return result;
  }, [selectedBrands, sortBy, availableListShoes]);

  // UI Helpers
  const widthOptions = [{ label: 'Narrow', img: imgNarrow }, { label: 'Regular', img: imgRegular }, { label: 'Wide', img: imgWide }];
  const archOptions = [{ label: 'Flat Arch', value: 'Flat', img: imgFlat }, { label: 'Normal Arch', value: 'Normal', img: imgNormal }, { label: 'High Arch', value: 'High', img: imgHigh }];
  const activeStyle = "border-blue-600 bg-blue-50 scale-105 shadow-md";
  const inactiveStyle = "border-gray-200 hover:border-blue-300";

  const SelectionGroup = ({ label, options, category, required = false }) => (
    <div className="mb-6 text-left">
      <label className="block text-xs font-bold mb-3 uppercase text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="flex gap-3">
        {options.map((opt) => {
          const isSelected = getCurrentValue(category) === opt;
          return (
            <button key={opt} onClick={() => handleToggleSelect(category, opt)} className={`flex-1 py-3 px-2 text-[11px] rounded-xl border-2 transition-all duration-200 font-bold ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md scale-105' : 'border-gray-200 text-gray-600 bg-white hover:border-blue-300'}`}>{opt}</button>
          )
        })}
      </div>
    </div>
  );

  // --- RENDER MENU ---
  if (step === "menu") {
    return (
      <div className="bg-white rounded-3xl shadow-xl w-[90%] max-w-[400px] p-8 mx-auto my-10 border border-gray-100">
        <h2 className="text-center font-bold tracking-[0.1em] mb-5 text-gray-800 text-xl">TYPES OF RUNNING</h2>
        <div className="flex flex-col gap-6">
          <div onClick={() => {setStep("road"); setShowMore(false);}} className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"><img src={roadImg} alt="Road" className="w-full h-[165px] object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all"><span className="text-white text-3xl font-extrabold drop-shadow-2xl [-webkit-text-stroke:1px_orange] uppercase tracking-wider">Road Running</span></div></div>
          <div onClick={() => {setStep("trail"); setShowMore(false);}} className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"><img src={trailImg} alt="Trail" className="w-full h-[165px] object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all"><span className="text-white text-3xl font-extrabold drop-shadow-2xl [-webkit-text-stroke:1px_orange] uppercase tracking-wider">Trail Running</span></div></div>
        </div>
      </div>
    );
  }

  // --- RENDER RESULT PAGE ---
  if (step === "results") {
    return (
      <div className="min-h-screen bg-gray-50 p-6 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setStep(roadData.purpose ? "road" : "trail")} className="text-sm font-bold text-gray-400 hover:text-blue-600">← BACK</button>
              <h1 className="text-2xl font-serif font-bold text-gray-800">Recommended for you :</h1>
            </div>
          </div>

          {/* TOP FEATURED SHOE */}
          {featuredShoe && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-br-xl shadow-sm z-20">TOP MATCH</div>
              <div className="w-full md:w-1/2 flex justify-center bg-blue-50 rounded-xl p-6 relative">
                <img src={featuredShoe.img || featuredShoe.image_url} alt={featuredShoe.name} className="w-[80%] object-contain drop-shadow-xl z-10 hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{featuredShoe.brand}</p>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight">{featuredShoe.name}</h2>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah event bubbling jika ada
                      // Gunakan shoe_id jika ada, jika tidak gunakan id, lalu konversi ke String
                      const idToToggle = String(featuredShoe.shoe_id || featuredShoe.id);
                      handleAddFavorite(idToToggle);
                    }}
                    className="transition-transform active:scale-90"
                  >
                    {/* Cek apakah ID ada di favoriteIds (pastikan konversi ke String juga) */}
                    {favoriteIds.includes(String(featuredShoe.shoe_id || featuredShoe.id)) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-500">
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 hover:text-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xl text-gray-700">Weight : {featuredShoe.weight}g</p>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <span className="text-xl font-bold text-gray-800">{featuredShoe.rating}</span>
                </div>
                <button className="bg-[#000080] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors shadow-lg">Learn More</button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8">
            
            {/* SIDEBAR FILTER (FIXED / NO SCROLL ISSUE) */}
            <div className="w-full md:w-1/4">
              <div className="bg-gray-100/50 rounded-2xl p-6 sticky top-4 max-h-[85vh] flex flex-col">
                
                {/* 1. BAGIAN ATAS (FIXED / DIAM) */}
                <div className="shrink-0">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Brand :</h3>
                  
                  {/* ACTIVE TAGS (HISTORY) */}
                  {selectedBrands.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
                        {selectedBrands.map(brand => (
                          <button 
                            key={brand} 
                            onClick={() => handleBrandToggle(brand)}
                            className="bg-blue-200 hover:bg-red-100 text-blue-900 hover:text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-sm border border-blue-200"
                          >
                            <span>{brand}</span>
                            <span className="font-black text-[10px]">✕</span>
                          </button>
                        ))}
                      </div>
                      <hr className="my-4 border-gray-300" />
                    </div>
                  )}
                </div>

                {/* 2. BAGIAN BAWAH (SCROLLABLE LIST) */}
                <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3 flex-1">
                  {BRANDS_LIST.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <div 
                        key={brand} 
                        onClick={() => handleBrandToggle(brand)} 
                        className="flex items-center gap-3 cursor-pointer group select-none hover:bg-gray-200/50 p-1.5 rounded-lg transition-colors"
                      >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${isChecked ? 'bg-orange-400 border-orange-400' : 'border-gray-400 bg-white'}`}>
                          {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <span className={`text-sm ${isChecked ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{brand}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="w-full md:w-3/4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif font-bold text-xl text-gray-800">Best Shoes For You :</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-100 border-none text-sm font-bold text-gray-800 rounded-lg py-2 pl-3 pr-8 cursor-pointer focus:ring-0">
                    <option value="recommended">Recommended</option>
                    <option value="lowHigh">Weight: low to high</option>
                    <option value="highLow">Weight: high to low</option>
                  </select>
                </div>
              </div>

              {filteredListShoes.length > 0 ? (
                filteredListShoes.map((shoe) => (
                  <div key={shoe.id || shoe.shoe_id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="w-full sm:w-[180px] h-[120px] bg-blue-50 rounded-lg flex items-center justify-center p-2">
                      <img src={shoe.img || shoe.image_url} alt={shoe.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">{shoe.brand}</p>
                      <h4 className="font-serif font-bold text-xl text-gray-900 mb-1">{shoe.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">Weight : {shoe.weight}g</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        <span className="text-sm font-bold">{shoe.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Biar tidak klik card-nya (kalau ada link detail)
                          // PENTING: Gunakan shoe.shoe_id (dari API) atau shoe.id (dari Mock)
                          handleAddFavorite(shoe.shoe_id || shoe.id);
                        }} 
                        className="transition-transform active:scale-90 text-gray-400 hover:text-red-500"
                      >
                        {/* Cek apakah ID sepatu ini ada di dalam list favoriteIds */}
                        {favoriteIds.includes(String(shoe.shoe_id || shoe.id)) ? (
                          // ICON MERAH (Filled)
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                          </svg>
                        ) : (
                          // ICON OUTLINE (Kosong)
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                          </svg>
                        )}
                      </button>
                      <button className="bg-[#000080] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors whitespace-nowrap">Learn More</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">No shoes found for selected filters.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FORM INPUT ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={() => setStep("menu")} className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 hover:text-orange-500">← BACK</button>
        <h1 className="text-center font-serif font-bold text-lg mb-1 mt-4 uppercase tracking-wider">{step === "road" ? "User Input Road" : "User Input Trail"}</h1>
        
        <div className="text-right mb-4">
          <button onClick={handleUseProfile} disabled={profileLoading} className="text-[10px] italic text-gray-500 hover:text-blue-600 underline disabled:opacity-50">
            {profileLoading ? "Loading Profile..." : "Use My Profile"}
          </button>
        </div>

        {/* INPUT: Foot Width */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold mb-3 uppercase text-gray-700">Foot Width Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 gap-3">
            {widthOptions.map((opt) => (
              <button key={opt.label} onClick={() => handleToggleSelect('footWidth', opt.label)} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${commonData.footWidth === opt.label ? activeStyle : inactiveStyle}`}>
                <img src={opt.img} alt={opt.label} className="h-10 w-auto mb-2" />
                <span className="text-[10px] font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INPUT: Arch Type */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold mb-3 uppercase text-gray-700">Arch Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-3 gap-3">
            {archOptions.map((opt) => (
              <button key={opt.label} onClick={() => handleToggleSelect('archType', opt.label)} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${commonData.archType === opt.label ? activeStyle : inactiveStyle}`}>
                <img src={opt.img} alt={opt.label} className="h-8 w-auto mb-2" />
                <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INPUT: Orthotics */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold mb-3 uppercase text-gray-700">Orthotics Usage <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-4">
            {['Yes', 'No'].map(val => (
              <button key={val} onClick={() => handleToggleSelect('orthotics', val)} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${commonData.orthotics === val ? 'border-blue-600 bg-blue-50 scale-105 shadow-md text-blue-900' : 'border-gray-200 hover:border-blue-400 hover:shadow-sm text-gray-600'}`}>
                <span className="text-xs font-bold text-center">{val === 'Yes' ? 'Yes, I use orthotics' : "No, I don't"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FORM LANJUTAN */}
        {step === "road" ? (
          <SelectionGroup label="Running Purpose" options={['Daily', 'Tempo', 'Race']} category="purpose" required />
        ) : (
          <div className="mb-6 text-left">
            <label className="block text-xs font-bold mb-3 uppercase text-gray-700">Trail Terrain <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-4">
              {['Mixed', 'Rocky', 'Muddy', 'Light'].map(t => (
                <button key={t} onClick={() => handleToggleSelect('terrain', t)} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${trailData.terrain === t ? activeStyle : inactiveStyle}`}>
                  <span className={`text-[11px] font-bold ${trailData.terrain === t ? 'text-blue-900' : 'text-gray-600'}`}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-2">
          <button onClick={() => setShowMore(!showMore)} className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-tighter transition-all border-b border-transparent hover:border-black">{showMore ? 'show less input -' : 'show more input +'}</button>
        </div>
        
        {showMore && (
            <div className="mt-4 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="mb-4 text-left">
                    <label className="block text-xs font-bold mb-2 uppercase text-gray-600">Pace Target (Optional)</label>
                    <div className="grid grid-cols-3 gap-2">
                    {[{ l: 'Easy', t: '(6:30 min/km)' }, { l: 'Steady', t: '(5-6:30 min/km)' }, { l: 'Fast', t: '(<5:00 min/km)' }].map(p => {
                        const currentPace = step === "road" ? roadData.pace : trailData.pace;
                        return (
                        <button key={p.l} onClick={() => handleToggleSelect('pace', p.l)} className={`border-2 p-1 rounded-xl transition-all ${currentPace === p.l ? 'border-blue-600 bg-blue-50 text-blue-900 scale-105 shadow-md' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                            <p className="text-[9px] font-bold">{p.l}</p>
                            <p className="text-[7px] font-medium opacity-80">{p.t}</p>
                        </button>
                        );
                    })}
                    </div>
                </div>

                {step === "road" && <SelectionGroup label="Cushion Preference (Optional)" options={['Soft', 'Balanced', 'Firm']} category="cushion" />}
                <SelectionGroup label="Season (Optional)" options={['Summer', 'Spring & Fall', 'Winter']} category="season" />
                
                {step === "road" && (
                    <div className="mb-4 text-left">
                        <label className="block text-xs font-bold mb-2 uppercase text-gray-600">Stability Need (Optional)</label>
                        <div className="flex gap-2 w-2/3">
                        {['Neutral', 'Guided'].map(s => (
                            <button key={s} onClick={() => handleToggleSelect('stability', s)} className={`flex-1 py-2 rounded-xl text-[10px] border-2 transition-all ${roadData.stability === s ? 'border-blue-600 bg-blue-50 text-blue-900 scale-105 shadow-md font-bold' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>{s}</button>
                        ))}
                        </div>
                    </div>
                )}

                <div className="mb-4 text-left">
                    <label className="block text-xs font-bold mb-2 uppercase text-gray-600">Strike pattern (Optional)</label>
                    <div className="flex gap-4 text-[10px]">
                    {['Heel', 'Mid', 'Forefoot'].map(s => {
                        const currentStrike = step === "road" ? roadData.strike : trailData.strike;
                        return (
                            <button key={s} onClick={() => handleToggleSelect('strike', s)} className="flex items-center gap-2 group">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${currentStrike === s ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                {currentStrike === s && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
                            </div>
                            <span className={currentStrike === s ? 'text-blue-900 font-bold' : 'text-gray-600'}>{s}</span>
                            </button>
                        );
                    })}
                    </div>
                </div>

                {step === "trail" && (
                    <>
                        <div className="mb-4 text-left">
                            <label className="block text-xs font-bold mb-2 uppercase text-gray-600">Water Resistant (Optional)</label>
                            <div className="flex gap-4 text-[10px]">
                            {['Waterproof', 'Water Repellent'].map(w => (
                                <button key={w} onClick={() => handleToggleSelect('waterResistant', w)} className="flex items-center gap-2 group">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${trailData.waterResistant === w ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>{trailData.waterResistant === w && <span className="text-blue-600 text-[8px]">✓</span>}</div>
                                <span className={trailData.waterResistant === w ? 'text-blue-900 font-bold' : 'text-gray-600'}>{w}</span>
                                </button>
                            ))}
                            </div>
                        </div>
                        <div className="mb-4 text-left">
                            <label className="block text-xs font-bold mb-2 uppercase text-gray-600">Rock Sensitivity (Optional)</label>
                            <div className="flex gap-4 text-[10px]">
                            {['Yes', 'No'].map(r => (
                                <button key={r} onClick={() => handleToggleSelect('rockSensitivity', r)} className="flex items-center gap-2 group">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all ${trailData.rockSensitivity === r ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>{trailData.rockSensitivity === r && <span className="text-blue-600 text-[8px]">✓</span>}</div>
                                <span className={trailData.rockSensitivity === r ? 'text-blue-900 font-bold' : 'text-gray-600'}>{r}</span>
                                </button>
                            ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}

      </div>

      <button 
        disabled={!isFormValid()}
        onClick={handleFind} 
        className={`mt-8 w-full max-w-md py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${isFormValid() ? 'bg-blue-900 text-white hover:bg-blue-800 active:scale-95 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {loading ? 'Finding...' : 'Find'}
      </button>
    </div>
  );
}