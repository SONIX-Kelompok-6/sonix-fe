import React, { useState, useMemo, useEffect } from "react";
import api from "../api/axios"; 
import { useNavigate, Link } from "react-router-dom";
import { getRecommendations, sendInteraction, getUserFeed } from "../services/SonixMl";
import { useShoes } from "../context/ShoeContext"; 

// --- IMPORT ASSETS ---
import roadImg from "../assets/recommendation-page/road.png";
import trailImg from "../assets/recommendation-page/trail.png";
import imgNarrow from '../assets/profile-images/foot-narrow.svg';
import imgRegular from '../assets/profile-images/foot-regular.svg';
import imgWide from '../assets/profile-images/foot-wide.svg';
import imgFlat from '../assets/profile-images/arch-flat.svg';
import imgNormal from '../assets/profile-images/arch-normal.svg';
import imgHigh from '../assets/profile-images/arch-high.svg';

const BRANDS_LIST = ["ASICS", "Nike", "New Balance", "Adidas", "Saucony", "HOKA", "Brooks", "On", "PUMA", "Altra", "Mizuno", "Salomon", "Under Armour", "Skechers", "Reebok", "Merrell", "Topo Athletic"];

const capitalizeFirst = (str) => {
  if (!str) return null;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function Recommendation() {
  const navigate = useNavigate();

  // --- AMBIL DATA DARI CONTEXT (GUDANG DATA) ---
  const { allShoes, isLoading: isContextLoading } = useShoes();

  const [step, setStep] = useState("menu"); 
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- STATE DATA ---
  const [searchResults, setSearchResults] = useState([]); 
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const [realtimeRecs, setRealtimeRecs] = useState([]);

  // STATES INPUT
  const [commonData, setCommonData] = useState({ footWidth: null, archType: null, orthotics: null });
  const [roadData, setRoadData] = useState({ purpose: null, pace: null, cushion: null, season: null, stability: null, strike: null });
  const [trailData, setTrailData] = useState({ terrain: null, pace: null, season: null, strike: null, waterResistant: null, rockSensitivity: null });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");

  // ==============================================
  // 1. HYBRID FEED TRIGGER (UPDATED: Hydration Support)
  // ==============================================
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token) {
      setError("Please login to use the Recommendation feature.");
    } else {
      setError(null);
      if (userId && allShoes.length > 0) { // Pastikan allShoes siap
        const fetchFeed = async () => {
          try {
            // Ambil Feed (Bisa berupa object lengkap ATAU cuma ID)
            const feed = await getUserFeed(userId);
            
            if (feed && feed.length > 0) {
               // 🔥 HYDRATION LOGIC: Convert ID/Partial Data -> Full Data dari Context
               const hydratedFeed = feed.map(item => {
                  const targetId = typeof item === 'object' ? (item.id || item.shoe_id) : item;
                  return allShoes.find(s => 
                      String(s.shoe_id) === String(targetId) || 
                      String(s.slug) === String(targetId) ||
                      String(s.id) === String(targetId)
                  );
               }).filter(Boolean); // Hapus yang undefined

               setSearchResults(hydratedFeed.length > 0 ? hydratedFeed : feed);
            }
          } catch (err) { console.error("Feed error:", err); }
        };
        fetchFeed();
      }
    }
  }, [allShoes.length]); // Re-run kalau context loaded

  // --- FETCH FAVORITES ---
  useEffect(() => {
    const fetchUserFavorites = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      try {
        const response = await api.get("/api/favorites/", {
          headers: { Authorization: `Token ${token}` },
        });
        const ids = response.data.map(item => String(item.shoe_id));
        setFavoriteIds(ids);
      } catch (err) { console.error("Gagal load favorites", err); }
    };
    fetchUserFavorites();
  }, []);

  // --- HANDLE USE MY PROFILE ---
  const handleUseProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) { setError("Please login to use profile."); return; }
    setProfileLoading(true);
    try {
      const response = await api.get("/api/profile/", { headers: { Authorization: `Token ${token}` } });
      const userProfile = response.data.profile || response.data;

      let mappedArch = null;
      if (userProfile.arch_type) {
         const archLower = userProfile.arch_type.toLowerCase();
         if (archLower.includes("flat")) mappedArch = "Flat";
         else if (archLower.includes("high")) mappedArch = "High";
         else mappedArch = "Normal";
      }

      let mappedWidth = null;
      if (userProfile.foot_width) {
          mappedWidth = capitalizeFirst(userProfile.foot_width.trim());
      }

      setCommonData({ 
          footWidth: mappedWidth, 
          archType: mappedArch, 
          orthotics: userProfile.uses_orthotics ? "Yes" : "No" 
      });
      setError(null);
    } catch (err) { setError("Failed to load profile."); } finally { setProfileLoading(false); }
  };

  // --- 3. HANDLE FIND (UPDATED: Handle IDs Only Response) ---
  const handleFind = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { setError("User ID not found. Please re-login."); return; }
    
    if (isContextLoading || !allShoes || allShoes.length === 0) {
        setError("Database is still loading... please wait a moment.");
        return;
    }

    setLoading(true);
    const cleanArch = commonData.archType; 
    const type = step === "road" ? "road" : "trail";
    let cleanWater = trailData.waterResistant;
    if (cleanWater === "Water Proof") cleanWater = "Waterproof";

    const payload = step === "road" ? {
      running_purpose: roadData.purpose,
      pace: roadData.pace,
      orthotic_usage: commonData.orthotics,
      arch_type: cleanArch,
      strike_pattern: roadData.strike,
      cushion_preferences: roadData.cushion,
      foot_width: commonData.footWidth,
      stability_need: roadData.stability,
      season: roadData.season
    } : {
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

    try {
      // 1. Minta Rekomendasi ke AI (Sekarang response lebih ringan, misal cuma ID)
      const response = await getRecommendations(type, payload);
      console.log("🔍 ML Raw Response:", response);

      let mlList = [];
      if (response && response.data && Array.isArray(response.data)) {
          mlList = response.data; 
      } else if (Array.isArray(response)) {
          mlList = response;      
      }

      console.log("📋 Extracted List:", mlList);

      if (mlList.length === 0) {
        setSearchResults([]);
        setStep("results");
        setLoading(false);
        return;
      }

      // 🔥 2. HYDRATION: GABUNGKAN ID DENGAN DATA CONTEXT (SPEED BOOST) 🔥
      const hydratedResults = mlList.map(mlItem => {
          // MODIFIKASI: Handle jika mlItem adalah STRING (ID langsung) atau OBJECT
          const targetId = typeof mlItem === 'object' ? (mlItem.id || mlItem.shoe_id) : mlItem;
          
          // Cari di database local (allShoes)
          // Cek string equality biar aman
          const foundShoe = allShoes.find(s => 
              String(s.shoe_id) === String(targetId) || 
              String(s.slug) === String(targetId) ||
              String(s.id) === String(targetId)
          );
          
          if (!foundShoe) console.warn(`⚠️ Shoe ID ${targetId} not found in Context.`);
          return foundShoe;
      }).filter(item => item !== undefined);

      console.log("✅ Final Results:", hydratedResults);

      setSearchResults(hydratedResults);
      setError(null);
      setStep("results");

    } catch (err) {
      console.error("❌ AI Error:", err);
      setError("AI Engine is busy. Please try again.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddFavorite = async (shoeId) => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    
    if (!token) { setError("Please login to save favorites."); return; }

    const idString = String(shoeId);
    const isCurrentlyFavorite = favoriteIds.includes(idString);
    const interactionValue = isCurrentlyFavorite ? 0 : 1; 

    setFavoriteIds((prevIds) => 
        isCurrentlyFavorite 
        ? prevIds.filter(id => id !== idString) 
        : [...prevIds, idString]
    );

    try {
      await api.post(
          "/api/favorites/toggle/", 
          { shoe_id: idString }, 
          { headers: { Authorization: `Token ${token}` } }
      );
      
      if (userId) {
        sendInteraction(userId, idString, 'like', interactionValue).catch(console.warn);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setFavoriteIds((prevIds) => 
          isCurrentlyFavorite ? [...prevIds, idString] : prevIds.filter(id => id !== idString)
      );
      setError("Failed to sync with server.");
    }
  };

  // --- LOGIC DISPLAY, SORT, & FILTER ---
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

  const handleBrandToggle = (brand) => { if (selectedBrands.includes(brand)) setSelectedBrands(selectedBrands.filter((b) => b !== brand)); else setSelectedBrands([...selectedBrands, brand]); };
  
  const sourceData = searchResults.length > 0 ? searchResults : []; 
  const featuredShoe = sourceData[0]; 
  const availableListShoes = sourceData.slice(1);
  
  const filteredListShoes = useMemo(() => {
    let result = [...availableListShoes]; 

    if (selectedBrands.length > 0) {
        result = result.filter(shoe => {
            if (!shoe.brand) return false;
            const shoeBrandClean = shoe.brand.toString().toLowerCase().trim();
            return selectedBrands.some(selected => 
                selected.toLowerCase().trim() === shoeBrandClean
            );
        });
    }

    if (sortBy === "lowHigh") result.sort((a, b) => (Number(a.weight_lab_oz) || 999) - (Number(b.weight_lab_oz) || 999));
    else if (sortBy === "highLow") result.sort((a, b) => (Number(b.weight_lab_oz) || 0) - (Number(a.weight_lab_oz) || 0));
    
    return result;
  }, [selectedBrands, sortBy, availableListShoes]);

  // Options UI
  const widthOptions = [{ label: 'Narrow', value: 'Narrow', img: imgNarrow }, { label: 'Regular', value: 'Regular', img: imgRegular }, { label: 'Wide', value: 'Wide', img: imgWide }];
  const archOptions = [{ label: 'Flat Arch', value: 'Flat', img: imgFlat }, { label: 'Normal Arch', value: 'Normal', img: imgNormal }, { label: 'High Arch', value: 'High', img: imgHigh }];
  const activeStyle = "border-blue-600 bg-blue-50 scale-105 shadow-md";
  const inactiveStyle = "border-gray-200 hover:border-blue-300";
  
  const SelectionGroup = ({ label, options, category, required = false }) => (
    <div className="mb-6 text-left">
      <label className="block text-xs font-bold mb-3 uppercase text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="flex gap-3">
        {options.map((opt) => {
          const valToCheck = opt.value || opt.label || opt; 
          const isSelected = getCurrentValue(category) === valToCheck;
          
          return (
            <button key={opt.label || opt} onClick={() => handleToggleSelect(category, valToCheck)} className={`flex-1 py-3 px-2 text-[11px] rounded-xl border-2 transition-all duration-200 font-bold ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md scale-105' : 'border-gray-200 text-gray-600 bg-white hover:border-blue-300'}`}>
                {opt.label || opt}
            </button>
          )
        })}
      </div>
    </div>
  );

  // --- RENDER MENU ---
  if (step === "menu") {
    return (
      <div className="bg-white rounded-3xl shadow-xl w-[90%] max-w-4xl p-8 mx-auto my-10 border border-gray-100 flex flex-col items-center transition-all duration-500">
        
        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {isContextLoading && (
            <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-xs font-bold animate-pulse">
                Preparing database...
            </div>
        )}

        <h2 className="text-center font-bold tracking-[0.1em] mb-8 text-gray-800 text-xl uppercase">
          Types of Running
        </h2>

        <div className="flex flex-col md:flex-row gap-6 w-full px-2">
          {/* --- ROAD RUNNING CARD --- */}
          <div 
            onClick={() => { if(!error && !isContextLoading) { setStep("road"); setShowMore(false); } }} 
            className={`relative flex-1 rounded-[2rem] overflow-hidden group shadow-lg transition-all duration-300 h-64 
              ${(error || isContextLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'}`
            }
          >
            <img src={roadImg} alt="Road" className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${(!error && !isContextLoading) && 'group-hover:scale-110'}`} />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-white text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase drop-shadow-lg text-center px-4">ROAD</span>
            </div>
          </div>

          {/* --- TRAIL RUNNING CARD --- */}
          <div 
            onClick={() => { if(!error && !isContextLoading) { setStep("trail"); setShowMore(false); } }} 
            className={`relative flex-1 rounded-[2rem] overflow-hidden group shadow-lg transition-all duration-300 h-64 
              ${(error || isContextLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'}`
            }
          >
            <img src={trailImg} alt="Trail" className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${(!error && !isContextLoading) && 'group-hover:scale-110'}`} />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-white text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase drop-shadow-lg text-center px-4">TRAIL</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER RESULT PAGE ---
  if (step === "results") {
      return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
           <div className="max-w-6xl mx-auto">
               <div className="flex flex-col gap-4 mb-6">
                 <div className="flex items-center gap-4">
                   <button onClick={() => setStep(roadData.purpose ? "road" : "trail")} className="text-sm font-bold text-gray-400 hover:text-blue-600">← BACK</button>
                   <h1 className="text-2xl font-serif font-bold text-gray-800">Recommended for you :</h1>
                 </div>
               </div>

               {featuredShoe ? (
                   <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border border-gray-100 relative overflow-hidden">
                       <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-br-xl shadow-sm z-20">TOP MATCH</div>
                       <div className="w-full md:w-1/2 flex justify-center bg-blue-50 rounded-xl p-6 relative">
                           <img src={featuredShoe.img || featuredShoe.img_url} alt={featuredShoe.name} className="w-[80%] object-contain drop-shadow-xl z-10 hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="w-full md:w-1/2 space-y-4">
                           <div className="flex justify-between items-start">
                               <div>
                                   <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{featuredShoe.brand}</p>
                                   <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight">{featuredShoe.name}</h2>
                               </div>
                               <button 
                                   onClick={(e) => { e.stopPropagation(); handleAddFavorite(String(featuredShoe.shoe_id || featuredShoe.id)); }} 
                                   className="transition-transform active:scale-90"
                               >
                                   {favoriteIds.includes(String(featuredShoe.shoe_id || featuredShoe.id)) ? (
                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-500"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
                                   ) : (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 hover:text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                                   )}
                               </button>
                           </div>
                           <p className="text-xl text-gray-700">Weight : {featuredShoe.weight_lab_oz}oz</p>
                           <div className="flex items-center gap-2 mb-4">
                               <svg className="w-6 h-6 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                               <span className="text-xl font-bold text-gray-800">{featuredShoe.rating ? featuredShoe.rating.toFixed(1) : "0.0"}</span>
                           </div>
                           <button 
                               onClick={() => navigate(`/shoe/${featuredShoe.slug || featuredShoe.id}`)}
                               className="bg-[#000080] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors shadow-lg"
                           >
                               Learn More
                           </button>
                       </div>
                   </div>
               ) : (
                 <div className="text-center py-20 text-gray-500 bg-white rounded-2xl mb-10 shadow-sm border border-gray-100">
                     <p className="text-lg">No recommendations found yet.</p>
                     <p className="text-sm">Try adjusting your filters or search again.</p>
                 </div>
               )}

               {realtimeRecs.length > 0 && (
                 <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 italic flex items-center gap-2">
                       <span>✨</span> Based on your last like (Real-time AI):
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                       {realtimeRecs.map(shoe => (
                         <div key={shoe.id || shoe.shoe_id} className="min-w-[180px] bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col items-center text-center">
                           <div className="h-24 w-full flex items-center justify-center mb-3">
                              <img src={shoe.img_url || shoe.img} className="max-h-full object-contain" alt={shoe.name} />
                           </div>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">{shoe.brand}</p>
                           <h4 className="text-xs font-bold text-gray-800 line-clamp-2">{shoe.name}</h4>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="flex flex-col md:flex-row gap-8">
                   <div className="w-full md:w-1/4">
                       <div className="bg-gray-100/50 rounded-2xl p-6 sticky top-4 max-h-[85vh] flex flex-col">
                           <div className="shrink-0">
                               <h3 className="text-lg font-bold text-gray-800 mb-4">Brand :</h3>
                               {selectedBrands.length > 0 && (
                                   <div className="mb-4">
                                       <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
                                           {selectedBrands.map(brand => (
                                               <button key={brand} onClick={() => handleBrandToggle(brand)} className="bg-blue-200 hover:bg-red-100 text-blue-900 hover:text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-sm border border-blue-200">
                                                   <span>{brand}</span><span className="font-black text-[10px]">✕</span>
                                               </button>
                                           ))}
                                       </div>
                                       <hr className="my-4 border-gray-300" />
                                   </div>
                               )}
                           </div>
                           <div className="overflow-y-auto custom-scrollbar pr-2 space-y-3 flex-1">
                               {BRANDS_LIST.map((brand) => {
                                   const isChecked = selectedBrands.includes(brand);
                                   return (
                                       <div key={brand} onClick={() => handleBrandToggle(brand)} className="flex items-center gap-3 cursor-pointer group select-none hover:bg-gray-200/50 p-1.5 rounded-lg transition-colors">
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
                                       <img src={shoe.img || shoe.img_url} alt={shoe.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                                   </div>
                                   <div className="flex-1 w-full">
                                       <p className="text-xs font-bold text-gray-500 uppercase mb-1">{shoe.brand}</p>
                                       <h4 className="font-serif font-bold text-xl text-gray-900 mb-1">{shoe.name}</h4>
                                       <p className="text-gray-600 text-sm mb-3">Weight : {shoe.weight_lab_oz}oz</p>
                                       <div className="flex items-center gap-1">
                                           <svg className="w-4 h-4 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                           <span className="text-sm font-bold">{shoe.rating ? shoe.rating.toFixed(1) : "0.0"}</span>
                                       </div>
                                   </div>
                                   <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                                       <button onClick={(e) => { e.stopPropagation(); handleAddFavorite(String(shoe.shoe_id || shoe.id)); }} className="transition-transform active:scale-90 text-gray-400 hover:text-red-500">
                                           {favoriteIds.includes(String(shoe.shoe_id || shoe.id)) ? (
                                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
                                           ) : (
                                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                                           )}
                                       </button>
                                       <button 
                                            onClick={() => navigate(`/shoe/${shoe.slug || shoe.shoe_id || shoe.id}`)}
                                            className="bg-[#000080] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors whitespace-nowrap"
                                       >
                                            Learn More
                                       </button>
                                   </div>
                               </div>
                           ))
                       ) : (<div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100">No shoes found for selected filters.</div>)}
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
        
        {error && (
            <div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2">
                <span>{error}</span>
                <Link to="/login" className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full hover:bg-red-700 transition-colors">Go to Login</Link>
            </div>
        )}

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
              <button key={opt.label} onClick={() => handleToggleSelect('footWidth', opt.value)} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${commonData.footWidth === opt.value ? activeStyle : inactiveStyle}`}>
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
              <button key={opt.label} onClick={() => handleToggleSelect('archType', opt.value)} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center transition-all ${commonData.archType === opt.value ? activeStyle : inactiveStyle}`}>
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
        disabled={!isFormValid() || error || isContextLoading} 
        onClick={handleFind} 
        className={`mt-8 w-full max-w-md py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${isFormValid() && !error && !isContextLoading ? 'bg-blue-900 text-white hover:bg-blue-800 active:scale-95 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {loading ? 'Finding...' : isContextLoading ? 'Loading Database...' : 'Find'}
      </button>
    </div>
  );
}