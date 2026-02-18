import React, { useState, useMemo, useEffect, useRef } from "react";
import api from "../api/axios"; 
import { useNavigate } from "react-router-dom";
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
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const BRANDS_LIST = ["ASICS", "Nike", "New Balance", "Adidas", "Saucony", "HOKA", "Brooks", "On", "PUMA", "Altra", "Mizuno", "Salomon", "Under Armour", "Skechers", "Reebok", "Merrell", "Topo Athletic"];

const capitalizeFirst = (str) => {
  if (!str) return null;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const gridStyle = {
  backgroundColor: "#f9fafb",
  backgroundImage: `
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px"
};

export default function Recommendation() {
  const navigate = useNavigate();
  const { allShoes, updateShoeState, isLoading: isContextLoading } = useShoes();

  // --- STATES ---
  const [step, setStep] = useState("menu"); 
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // State baru untuk Mobile Filter Toggle
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [searchResults, setSearchResults] = useState([]); 
  const [favoriteIds, setFavoriteIds] = useState([]); 
  const [realtimeRecs, setRealtimeRecs] = useState([]);

  const [commonData, setCommonData] = useState({ footWidth: null, archType: null, orthotics: null });
  const [roadData, setRoadData] = useState({ purpose: null, pace: null, cushion: null, season: null, stability: null, strike: null });
  const [trailData, setTrailData] = useState({ terrain: null, pace: null, season: null, strike: null, waterResistant: null, rockSensitivity: null });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState("recommended");

  const prefetchRef = useRef(null);
  
  // --- HELPER NOTIFIKASI ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message) => {
    setNotification(message);
  };

  // RESTORE STATE
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem("rush_rec_state");
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setCommonData(parsed.commonData);
        setRoadData(parsed.roadData);
        setTrailData(parsed.trailData);
        setSearchResults(parsed.results || []);
        if (parsed.step) {
            setStep(parsed.step);
        }
      }
    } catch (e) {
      console.warn("Gagal restore state", e);
    }
  }, []);

  const saveStateToStorage = (currentStep, results = searchResults) => {
    const stateToSave = {
        step: currentStep,
        results: results,
        commonData,
        roadData,
        trailData
    };
    sessionStorage.setItem("rush_rec_state", JSON.stringify(stateToSave));
  };

  const goToDetail = (slug) => {
      if (!slug) return;
      navigate(`/shoe/${slug}`);
  };

  // CEK LOGIN & FEED
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");

    if (!token) {
        setAuthError("Please login to use the Recommendation feature.");
    } else {
        setAuthError(null);
        if (userId && allShoes.length > 0) { 
            const fetchFeed = async () => {
            try {
                const feed = await getUserFeed(userId);
                if (feed && feed.length > 0) {
                const hydratedFeed = feed.map(item => {
                    const targetId = typeof item === 'object' ? (item.id || item.shoe_id) : item;
                    return allShoes.find(s => 
                        String(s.shoe_id) === String(targetId) || 
                        String(s.id) === String(targetId)
                    );
                }).filter(Boolean);
                setRealtimeRecs(hydratedFeed); 
                }
            } catch (err) { console.error("Feed error:", err); }
            };
            fetchFeed();
        }
    }
  }, [allShoes.length]);

  // FETCH FAVORITES
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

  const isFormValid = () => {
    const baseValid = commonData.footWidth && commonData.archType && commonData.orthotics;
    if (step === "road") return baseValid && roadData.purpose;
    if (step === "trail") return baseValid && trailData.terrain;
    return false;
  };

  const performFetch = async () => {
    const type = step === "road" ? "road" : "trail";
    const cleanArch = commonData.archType; 
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

    const response = await getRecommendations(type, payload);
    let mlList = Array.isArray(response) ? response : (response.data || []);
    if (mlList.length === 0) return [];

    const hydratedResults = mlList.map(targetId => {
        const cleanId = String(targetId).trim();
        return allShoes.find(s => 
            String(s.shoe_id) === cleanId || 
            String(s.id) === cleanId ||
            String(s.slug) === cleanId
        );
    }).filter(item => item !== undefined);

    return hydratedResults;
  };

  // AUTO PREFETCH & SAVE
  useEffect(() => {
    const valid = isFormValid();
    if (valid && !prefetchRef.current && !loading && !error && !isContextLoading && !authError) {
       prefetchRef.current = performFetch().catch(err => {
           console.warn("Silent prefetch failed", err);
           return null;
       });
    }
    if (step !== 'menu') {
        saveStateToStorage(step, searchResults);
    }
  }, [commonData, roadData, trailData, step, authError, searchResults]); 

  const handleFind = async () => {
    if (authError) return;
    if (isContextLoading || !allShoes || allShoes.length === 0) {
        setError("Database is still loading... please wait a moment.");
        return;
    }
    setLoading(true);
    try {
      let results;
      if (prefetchRef.current) {
          results = await prefetchRef.current; 
          prefetchRef.current = null; 
      } else {
          results = await performFetch(); 
      }
      const finalResults = results || [];
      setSearchResults(finalResults);
      setError(null);
      setStep("results");
      saveStateToStorage("results", finalResults);
    } catch (err) {
      setError("AI Engine is busy. Please try again.");
      prefetchRef.current = null;
    } finally { setLoading(false); }
  };

  const handleUseProfile = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return;
    setProfileLoading(true);
    prefetchRef.current = null;
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
      if (userProfile.foot_width) mappedWidth = capitalizeFirst(userProfile.foot_width.trim());
      setCommonData({ footWidth: mappedWidth, archType: mappedArch, orthotics: userProfile.uses_orthotics ? "Yes" : "No" });
      setError(null);
      showNotification("Profile data loaded! ✅");
    } catch (err) { setError("Failed to load profile."); } finally { setProfileLoading(false); }
  };

  const handleAddFavorite = async (shoeId) => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("userId");
    if (!token) return;

    const idString = String(shoeId);
    const isCurrentlyFavorite = favoriteIds.includes(idString);
    const newStatus = !isCurrentlyFavorite; 
    setFavoriteIds((prevIds) => isCurrentlyFavorite ? prevIds.filter(id => id !== idString) : [...prevIds, idString]);
    
    if (allShoes.length > 0) {
        const updatedGlobalList = allShoes.map(shoe => {
            if (String(shoe.shoe_id) === idString || String(shoe.id) === idString) {
                return { ...shoe, isFavorite: newStatus };
            }
            return shoe;
        });
        updateShoeState(updatedGlobalList);
    }

    showNotification(newStatus ? "Added to Favorites ❤️" : "Removed from Favorites 💔");

    try {
      const interactionValue = newStatus ? 1 : 0;
      const favPromise = api.post("/api/favorites/toggle/", { shoe_id: idString }, { headers: { Authorization: `Token ${token}` } });
      if (userId) sendInteraction(userId, idString, 'like', interactionValue).catch(console.warn);
      await favPromise; 
    } catch (err) {
      setFavoriteIds((prevIds) => isCurrentlyFavorite ? [...prevIds, idString] : prevIds.filter(id => id !== idString));
      updateShoeState(allShoes); 
      showNotification("Failed to update favorite ⚠️");
    }
  };

  const handleToggleSelect = (category, value) => {
    prefetchRef.current = null;
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

  const handleBrandToggle = (brand) => { if (selectedBrands.includes(brand)) setSelectedBrands(selectedBrands.filter((b) => b !== brand)); else setSelectedBrands([...selectedBrands, brand]); };
  
  const filteredListShoes = useMemo(() => {
    let result = [...(searchResults.length > 0 ? searchResults.slice(1) : [])]; 
    if (selectedBrands.length > 0) {
        result = result.filter(shoe => {
            if (!shoe.brand) return false;
            const shoeBrandClean = shoe.brand.toString().toLowerCase().trim();
            return selectedBrands.some(selected => selected.toLowerCase().trim() === shoeBrandClean);
        });
    }
    if (sortBy === "lowHigh") result.sort((a, b) => (Number(a.weight_lab_oz) || 999) - (Number(b.weight_lab_oz) || 999));
    else if (sortBy === "highLow") result.sort((a, b) => (Number(b.weight_lab_oz) || 0) - (Number(a.weight_lab_oz) || 0));
    return result;
  }, [searchResults, selectedBrands, sortBy]);

  const featuredShoe = searchResults.length > 0 ? searchResults[0] : null;

  const widthOptions = [{ label: 'Narrow', value: 'Narrow', img: imgNarrow }, { label: 'Regular', value: 'Regular', img: imgRegular }, { label: 'Wide', value: 'Wide', img: imgWide }];
  const archOptions = [{ label: 'Flat Arch', value: 'Flat', img: imgFlat }, { label: 'Normal Arch', value: 'Normal', img: imgNormal }, { label: 'High Arch', value: 'High', img: imgHigh }];
  const activeStyle = "border-blue-600 bg-blue-50 scale-105 shadow-md font-bold text-blue-900";
  const inactiveStyle = "border-gray-200 hover:border-blue-300 text-gray-700 font-bold bg-white";
  
  const SelectionGroup = ({ label, options, category, required = false }) => (
    <div className="mb-6 text-left">
      <label className="block text-sm font-bold mb-3 uppercase text-gray-800">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="flex gap-3">
        {options.map((opt) => {
          const valToCheck = opt.value || opt.label || opt; 
          const isSelected = getCurrentValue(category) === valToCheck;
          return (
            <button key={opt.label || opt} onClick={() => handleToggleSelect(category, valToCheck)} className={`flex-1 py-3 px-2 text-[12px] rounded-xl border-2 transition-all duration-200 ${isSelected ? activeStyle : inactiveStyle}`}>
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
      <div className="min-h-screen flex flex-col items-center justify-center pt-24 md:pt-30" style={gridStyle}>
        <Navbar />
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl w-[90%] max-w-4xl p-6 md:p-8 border border-gray-100 flex flex-col items-center transition-all duration-500">
          
          {authError && (
            <div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2">
                <span>{authError}</span>
            </div>
          )}

          {error && !authError && (
            <div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2"><span>{error}</span></div>
          )}
          
          {isContextLoading && (
              <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-xs font-bold animate-pulse">Preparing database...</div>
          )}
          
          <h2 className="text-center font-bold tracking-[0.1em] mb-8 text-gray-800 text-xl uppercase">Types of Running</h2>
          
          <div className={`flex flex-col md:flex-row gap-6 w-full px-2 transition-all duration-300 ${authError ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
            {/* BUTTON ROAD */}
            <div 
                onClick={() => { 
                    if(!authError && !error && !isContextLoading) { 
                        sessionStorage.removeItem("rush_rec_state");
                        setStep("road"); 
                        setShowMore(false); 
                    } 
                }} 
                // PERBAIKAN DISINI: Ganti flex-1 dengan w-full md:flex-1 agar tidak collapse di mobile
                className={`relative w-full md:flex-1 rounded-[2rem] overflow-hidden group shadow-lg transition-all duration-300 h-48 md:h-64 ${(error || isContextLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'}`}>
              <img src={roadImg} alt="Road" className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${(!error && !isContextLoading) && 'group-hover:scale-110'}`} />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center z-10"><span className="text-white text-3xl md:text-5xl font-bold tracking-[0.25em] uppercase drop-shadow-lg text-center px-4">ROAD</span></div>
            </div>

            {/* BUTTON TRAIL */}
            <div 
                onClick={() => { 
                    if(!authError && !error && !isContextLoading) { 
                        sessionStorage.removeItem("rush_rec_state");
                        setStep("trail"); 
                        setShowMore(false); 
                    } 
                }} 
                // PERBAIKAN DISINI: Ganti flex-1 dengan w-full md:flex-1
                className={`relative w-full md:flex-1 rounded-[2rem] overflow-hidden group shadow-lg transition-all duration-300 h-48 md:h-64 ${(error || isContextLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:-translate-y-1'}`}>
              <img src={trailImg} alt="Trail" className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${(!error && !isContextLoading) && 'group-hover:scale-110'}`} />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center z-10"><span className="text-white text-3xl md:text-5xl font-bold tracking-[0.25em] uppercase drop-shadow-lg text-center px-4">TRAIL</span></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // --- RENDER RESULT PAGE ---
  if (step === "results") {
      return (
        <div className="min-h-screen p-4 md:p-6 pt-24 md:pt-30 font-sans" style={gridStyle}>
          <Navbar />
           <div className="max-w-6xl mx-auto">
               <div className="flex flex-col gap-4 mb-6">
                 <div className="flex items-center gap-4">
                   <button onClick={() => setStep(roadData.purpose ? "road" : "trail")} className="text-sm font-bold text-gray-400 hover:text-blue-600 bg-white/50 px-3 py-1 rounded-full">← BACK</button>
                   <h1 className="text-xl md:text-2xl font-serif font-bold text-gray-800">Recommended for you :</h1>
                 </div>
               </div>
               
               {/* --- FEATURED SHOE --- */}
               {featuredShoe ? (
                   <div 
                      onClick={() => goToDetail(featuredShoe.slug || featuredShoe.id)}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-4 md:p-8 mb-6 md:mb-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 border border-gray-100 relative overflow-hidden cursor-pointer group"
                   >
                       <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] md:text-xs font-bold px-4 py-1 rounded-br-xl shadow-sm z-20">TOP MATCH</div>
                       <div className="w-full md:w-1/2 flex justify-center bg-blue-50 rounded-xl p-4 md:p-6 relative">
                           <img src={featuredShoe.img || featuredShoe.img_url} alt={featuredShoe.name} className="w-[70%] md:w-[80%] object-contain drop-shadow-xl z-10 hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="w-full md:w-1/2 space-y-3 md:space-y-4 text-center md:text-left">
                           <div className="flex justify-between items-start">
                               <div className="w-full md:w-auto">
                                   <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider mb-1">{featuredShoe.brand}</p>
                                   <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors">{featuredShoe.name}</h2>
                               </div>
                               <button onClick={(e) => { e.stopPropagation(); handleAddFavorite(String(featuredShoe.shoe_id || featuredShoe.id)); }} className="transition-transform active:scale-90 cursor-pointer p-2 rounded-full hover:bg-gray-100 hidden md:block">
                                   {favoriteIds.includes(String(featuredShoe.shoe_id || featuredShoe.id)) ? (
                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-red-500"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
                                   ) : (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 hover:text-red-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                                   )}
                               </button>
                           </div>
                           <p className="text-lg md:text-xl text-gray-700">Weight : {featuredShoe.weight_lab_oz}oz</p>
                           <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                               <svg className="w-6 h-6 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                               <span className="text-xl font-bold text-gray-800">{featuredShoe.rating ? featuredShoe.rating.toFixed(1) : "0.0"}</span>
                           </div>
                           <button onClick={(e) => {e.stopPropagation(); goToDetail(featuredShoe.slug || featuredShoe.id)}} className="w-full md:w-auto bg-[#000080] text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition-colors shadow-lg cursor-pointer">Learn More</button>
                       </div>
                   </div>
               ) : (<div className="text-center py-20 text-gray-500 bg-white/80 rounded-2xl mb-10 shadow-sm border border-gray-100"><p className="text-lg">No recommendations found yet.</p><p className="text-sm">Try adjusting your filters or search again.</p></div>)}

               {/* --- CONTENT AREA (FILTER + LIST) --- */}
               <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                   
                   {/* MOBILE FILTER BUTTON TOGGLE */}
                   <div className="md:hidden">
                        <button 
                            onClick={() => setShowMobileFilter(!showMobileFilter)}
                            className="w-full bg-white border border-gray-300 py-3 rounded-xl font-bold text-gray-700 shadow-sm flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                            </svg>
                            {showMobileFilter ? 'Hide Filters' : 'Show Brand Filters'}
                        </button>
                   </div>

                   {/* --- SIDEBAR FILTER (Responsif) --- */}
                   <div className={`w-full md:w-1/4 ${showMobileFilter ? 'block' : 'hidden'} md:block`}>
                       <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sticky top-24 max-h-[60vh] md:max-h-[85vh] flex flex-col shadow-sm border border-gray-100 z-10">
                           <div className="shrink-0">
                               <h3 className="text-lg font-bold text-gray-800 mb-4">Brand :</h3>
                               {selectedBrands.length > 0 && (
                                   <div className="mb-4">
                                       <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
                                           {selectedBrands.map(brand => (
                                               <button key={brand} onClick={() => handleBrandToggle(brand)} className="bg-blue-200 hover:bg-red-100 text-blue-900 hover:text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-sm border border-blue-200"><span>{brand}</span><span className="font-black text-[10px]">✕</span></button>
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

                   {/* --- LIST SHOES --- */}
                   <div className="w-full md:w-3/4 space-y-4">
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                           <h3 className="font-serif font-bold text-xl text-gray-800">Best Shoes For You :</h3>
                           <div className="flex items-center gap-2">
                               <span className="text-sm text-gray-600">Sort by:</span>
                               <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border-none text-sm font-bold text-gray-800 rounded-lg py-2 pl-3 pr-8 cursor-pointer focus:ring-0 shadow-sm">
                                   <option value="recommended">Recommended</option>
                                   <option value="lowHigh">Weight: low to high</option>
                                   <option value="highLow">Weight: high to low</option>
                               </select>
                           </div>
                       </div>
                       {filteredListShoes.length > 0 ? (
                           filteredListShoes.map((shoe) => (
                               <div 
                                 key={shoe.id || shoe.shoe_id} 
                                 onClick={() => goToDetail(shoe.slug || shoe.shoe_id || shoe.id)}
                                 className="bg-white/90 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                               >
                                   <div className="w-full sm:w-[180px] h-[140px] sm:h-[120px] bg-blue-50 rounded-lg flex items-center justify-center p-2">
                                       <img src={shoe.img || shoe.img_url} alt={shoe.name} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                                   </div>
                                   <div className="flex-1 w-full text-center sm:text-left">
                                       <p className="text-xs font-bold text-gray-500 uppercase mb-1">{shoe.brand}</p>
                                       <h4 className="font-serif font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-900 transition-colors">{shoe.name}</h4>
                                       <p className="text-gray-600 text-sm mb-3">Weight : {shoe.weight_lab_oz}oz</p>
                                       <div className="flex items-center justify-center sm:justify-start gap-1">
                                           <svg className="w-4 h-4 text-gray-800 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                           <span className="text-sm font-bold">{shoe.rating ? shoe.rating.toFixed(1) : "0.0"}</span>
                                       </div>
                                   </div>
                                   <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                                       <button onClick={(e) => { e.stopPropagation(); handleAddFavorite(String(shoe.shoe_id || shoe.id)); }} className="transition-transform active:scale-90 text-gray-400 hover:text-red-500 cursor-pointer p-2 rounded-full hover:bg-gray-100">
                                           {favoriteIds.includes(String(shoe.shoe_id || shoe.id)) ? (
                                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500"><path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" /></svg>
                                           ) : (
                                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                                           )}
                                       </button>
                                       <button onClick={() => { e.stopPropagation(); goToDetail(shoe.slug || shoe.shoe_id || shoe.id); }} className="bg-[#000080] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-900 transition-colors whitespace-nowrap cursor-pointer flex-1 sm:flex-none">Learn More</button>
                                   </div>
                               </div>
                           ))
                       ) : (<div className="text-center py-20 text-gray-500 bg-white/80 rounded-xl border border-gray-100">No shoes found for selected filters.</div>)}
                   </div>
               </div>
           </div>
           <Footer />

           <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 transition-all duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
             <span className="text-sm font-bold">{notification}</span>
           </div>
        </div>
      );
  }

  // --- FORM INPUT ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pt-24 md:pt-30 font-sans animate-in fade-in duration-500" style={gridStyle}>
      <Navbar />
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-100">
        <button 
            onClick={() => {
                setStep("menu");
                sessionStorage.removeItem("rush_rec_state"); 
            }} 
            className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 hover:text-orange-500 bg-gray-50 px-2 py-1 rounded-full cursor-pointer"
        >
            ← BACK
        </button>

        <h1 className="text-center font-bold text-2xl text-gray-800 mb-4 mt-2 uppercase tracking-widest">
          {step === "road" ? "User Input Road" : "User Input Trail"}
        </h1>
        
        {error && (<div className="w-full bg-red-50 border border-red-100 text-red-600 font-medium py-3 px-4 rounded-xl text-center shadow-sm mb-6 text-xs flex flex-col items-center gap-2"><span>{error}</span></div>)}
        
        <div className="text-right mb-4"><button onClick={handleUseProfile} disabled={profileLoading} className="text-[12px] italic text-gray-500 hover:text-blue-600 underline disabled:opacity-50 cursor-pointer">{profileLoading ? "Loading Profile..." : "Use My Profile"}</button></div>
        
        <div className="mb-6 text-left"><label className="block text-sm font-bold mb-3 uppercase text-gray-800">Foot Width Type <span className="text-red-500">*</span></label><div className="grid grid-cols-3 gap-2 md:gap-3">{widthOptions.map((opt) => (<button key={opt.label} onClick={() => handleToggleSelect('footWidth', opt.value)} className={`cursor-pointer border-2 rounded-xl p-2 md:p-3 flex flex-col items-center transition-all ${commonData.footWidth === opt.value ? activeStyle : inactiveStyle}`}><img src={opt.img} alt={opt.label} className="h-8 md:h-10 w-auto mb-2" /><span className="text-[10px] md:text-[12px] font-bold">{opt.label}</span></button>))}</div></div>
        
        <div className="mb-6 text-left"><label className="block text-sm font-bold mb-3 uppercase text-gray-800">Arch Type <span className="text-red-500">*</span></label><div className="grid grid-cols-3 gap-2 md:gap-3">{archOptions.map((opt) => (<button key={opt.label} onClick={() => handleToggleSelect('archType', opt.value)} className={`cursor-pointer border-2 rounded-xl p-2 md:p-3 flex flex-col items-center transition-all ${commonData.archType === opt.value ? activeStyle : inactiveStyle}`}><img src={opt.img} alt={opt.label} className="h-6 md:h-8 w-auto mb-2" /><span className="text-[10px] md:text-[12px] font-bold leading-tight">{opt.label}</span></button>))}</div></div>
        
        <div className="mb-6 text-left"><label className="block text-sm font-bold mb-3 uppercase text-gray-800">Orthotics Usage <span className="text-red-500">*</span></label><div className="grid grid-cols-2 gap-4">{['Yes', 'No'].map(val => (<button key={val} onClick={() => handleToggleSelect('orthotics', val)} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${commonData.orthotics === val ? activeStyle : inactiveStyle}`}><span className="text-xs font-bold text-center">{val === 'Yes' ? 'Yes, I use orthotics' : "No, I don't"}</span></button>))}</div></div>

        {step === "road" ? (<SelectionGroup label="Running Purpose" options={['Daily', 'Tempo', 'Race']} category="purpose" required />) : (<div className="mb-6 text-left"><label className="block text-sm font-bold mb-3 uppercase text-gray-800">Trail Terrain <span className="text-red-500">*</span></label><div className="grid grid-cols-2 gap-4">{['Mixed', 'Rocky', 'Muddy', 'Light'].map(t => (<button key={t} onClick={() => handleToggleSelect('terrain', t)} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${trailData.terrain === t ? activeStyle : inactiveStyle}`}><span className={`text-[12px] font-bold ${trailData.terrain === t ? 'text-blue-900' : 'text-gray-700'}`}>{t}</span></button>))}</div></div>)}

        <div className="text-center mt-2">
          <button 
            onClick={() => setShowMore(!showMore)} 
            className="flex items-center justify-center gap-1 mx-auto text-[12px] font-bold text-black hover:text-gray-600 uppercase tracking-tighter transition-all border-b border-transparent hover:border-black group"
          >
            <span>{showMore ? 'show less input' : 'show more input'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={`w-3 h-3 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
        
        {showMore && (
            <div className="mt-4 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="mb-4 text-left"><label className="block text-sm font-bold mb-2 uppercase text-gray-800">Pace Target (Optional)</label><div className="grid grid-cols-3 gap-2">{[{ l: 'Easy', t: '(6:30 min/km)' }, { l: 'Steady', t: '(5-6:30 min/km)' }, { l: 'Fast', t: '(<5:00 min/km)' }].map(p => {const currentPace = step === "road" ? roadData.pace : trailData.pace;return (<button key={p.l} onClick={() => handleToggleSelect('pace', p.l)} className={`border-2 p-1 rounded-xl transition-all ${currentPace === p.l ? activeStyle : inactiveStyle}`}><p className="text-[10px] md:text-[12px] font-bold">{p.l}</p><p className="text-[8px] font-bold opacity-80">{p.t}</p></button>);})}</div></div>
                {step === "road" && <SelectionGroup label="Cushion Preference (Optional)" options={['Soft', 'Balanced', 'Firm']} category="cushion" />}
                <SelectionGroup label="Season (Optional)" options={['Summer', 'Spring & Fall', 'Winter']} category="season" />
                {step === "road" && (<div className="mb-4 text-left"><label className="block text-sm font-bold mb-2 uppercase text-gray-800">Stability Need (Optional)</label><div className="flex gap-2 w-full md:w-2/3">{['Neutral', 'Guided'].map(s => (<button key={s} onClick={() => handleToggleSelect('stability', s)} className={`flex-1 py-2 rounded-xl text-[12px] border-2 transition-all ${roadData.stability === s ? activeStyle : inactiveStyle}`}>{s}</button>))}</div></div>)}
                <div className="mb-4 text-left"><label className="block text-sm font-bold mb-2 uppercase text-gray-800">Strike pattern (Optional)</label><div className="flex flex-wrap gap-4 text-[12px]">{['Heel', 'Mid', 'Forefoot'].map(s => {const currentStrike = step === "road" ? roadData.strike : trailData.strike;return (<button key={s} onClick={() => handleToggleSelect('strike', s)} className="flex items-center gap-2 group"><div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${currentStrike === s ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>{currentStrike === s && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}</div><span className={currentStrike === s ? 'text-blue-900 font-bold' : 'text-gray-700 font-bold'}>{s}</span></button>);})}</div></div>
                {step === "trail" && (<><div className="mb-4 text-left"><label className="block text-sm font-bold mb-2 uppercase text-gray-800">Water Resistant (Optional)</label><div className="flex flex-wrap gap-4 text-[12px]">{['Waterproof', 'Water Repellent'].map(w => (<button key={w} onClick={() => handleToggleSelect('waterResistant', w)} className="flex items-center gap-2 group"><div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${trailData.waterResistant === w ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>{trailData.waterResistant === w && <span className="text-blue-600 text-[10px]">✓</span>}</div><span className={trailData.waterResistant === w ? 'text-blue-900 font-bold' : 'text-gray-700 font-bold'}>{w}</span></button>))}</div></div><div className="mb-4 text-left"><label className="block text-sm font-bold mb-2 uppercase text-gray-800">Rock Sensitivity (Optional)</label><div className="flex gap-4 text-[12px]">{['Yes', 'No'].map(r => (<button key={r} onClick={() => handleToggleSelect('rockSensitivity', r)} className="flex items-center gap-2 group"><div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${trailData.rockSensitivity === r ? 'border-blue-600 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}>{trailData.rockSensitivity === r && <span className="text-blue-600 text-[10px]">✓</span>}</div><span className={trailData.rockSensitivity === r ? 'text-blue-900 font-bold' : 'text-gray-700 font-bold'}>{r}</span></button>))}</div></div></>)}
            </div>
        )}
      </div>

      <button 
        disabled={!isFormValid() || error || isContextLoading} 
        onClick={handleFind} 
        className={`mt-6 md:mt-8 w-full max-w-md py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${isFormValid() && !error && !isContextLoading ? 'bg-blue-900 text-white hover:bg-blue-800 active:scale-95 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {loading ? 'Finding...' : isContextLoading ? 'Loading Database...' : 'Find'}
      </button>
      <Footer />

      {/* 🔥 TOAST NOTIFICATION COMPONENT 🔥 */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 transition-all duration-300 ${notification ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <span className="text-sm font-bold">{notification}</span>
      </div>
    </div>
  );
}