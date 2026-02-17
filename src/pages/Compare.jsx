import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from "../api/axios"; 

export default function Compare() {
  const [allShoesDb, setAllShoesDb] = useState([]); 
  const [selectedShoes, setSelectedShoes] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. KONFIGURASI LOGIC TAMPILAN DATA ---
  const SPEC_CONFIG = [
    {
      label: "Lightweight",
      getValue: (s) => s.lightweight ? "✅" : "❌"
    },
    {
      label: "Rocker",
      getValue: (s) => s.rocker ? "✅" : "❌"
    },
    {
      label: "Removable Insole",
      getValue: (s) => s.removable_insole ? "✅" : "❌"
    },
    { 
      label: "Pace", 
      getValue: (s) => {
        let paces = [];
        if (s.pace_daily_running === 1) paces.push("Daily Run");
        if (s.pace_tempo === 1) paces.push("Tempo");
        if (s.pace_competition === 1) paces.push("Competition");
        return paces.length > 0 ? paces.join(", ") : "-";
      }
    },
    {
      label: "Trail Terrain",
      getValue: (s) => {
        let terrain = [];
        if (s.terrain_light === 1) terrain.push("Light");
        if (s.terrain_moderate === 1) terrain.push("Moderate");
        if (s.terrain_technical === 1) terrain.push("Technical");
        return terrain.length > 0 ? terrain.join(", ") : "-";
      }
    },
    { 
      label: "Arch Type", 
      getValue: (s) => {
        if (s.arch_neutral === 1) return "Neutral";
        if (s.arch_stability === 1) return "Stability";
        return "-";
      }
    },
    { 
      label: "Weight", 
      getValue: (s) => s.weight_lab_oz ? `${s.weight_lab_oz} oz` : "-" 
    },
    { 
      label: "Heel Drop", 
      getValue: (s) => s.drop_lab_mm ? `${s.drop_lab_mm} mm` : "-" 
    },
    {
      label: "Shock Absorption",
      getValue: (s) => {
        let shock = [];
        if (s.shock_absorption === 1) shock.push("Low"); 
        if (s.shock_absorption === 3) shock.push("Moderate"); 
        if (s.shock_absorption === 5) shock.push("High");
        return shock.length > 0 ? shock.join(", ") : "-"; 
      }
    },
    {
      label: "Energy Return",
      getValue: (s) => {
        let energy = [];
        if (s.energy_return === 1) energy.push("Low");
        if (s.energy_return === 3) energy.push("Moderate");
        if (s.energy_return === 5) energy.push("High");
        return energy.length > 0 ? energy.join(", ") : "-";
      }
    },
    {
      label: "Traction",
      getValue: (s) => {
        let traction = [];
        if (s.traction_scaled === 1) traction.push("Low");
        if (s.traction_scaled === 3) traction.push("Moderate");
        if (s.traction_scaled === 5) traction.push("High");
        return traction.length > 0 ? traction.join(", ") : "-";
      }
    },
    {
      label: "Strike Pattern",
      getValue: (s) => {
        let strike = [];
        if (s.strike_heel === 1) strike.push("Heel");
        if (s.strike_mid === 1) strike.push("Mid");
        if (s.strike_forefoot === 1) strike.push("Forefoot");
        return strike.length > 0 ? strike.join(", ") : "-";
      }
    },
    {
      label: "Midsole Softness",
      getValue: (s) => {
        let midsole = [];
        if (s.midsole_softness === 1) midsole.push("Firm");
        if (s.midsole_softness === 3) midsole.push("Balanced");
        if (s.midsole_softness === 5) midsole.push("Soft");
        return midsole.length > 0 ? midsole.join(", ") : "-"; 
      }
    },
    {
      label: "Toebox Durability",
      getValue: (s) => {
        let toebox = [];
        if (s.toebox_durability === 1) toebox.push("Very Bad");
        if (s.toebox_durability === 2) toebox.push("Bad");
        if (s.toebox_durability === 3) toebox.push("Decent");
        if (s.toebox_durability === 4) toebox.push("Good");
        if (s.toebox_durability === 5) toebox.push("Very Good");
        return toebox.length > 0 ? toebox.join(", ") : "-";
      }
    },
    {
      label: "Heel Durability",
      getValue: (s) => {
        let heel = [];
        if (s.heel_durability === 1) heel.push("Very Bad");
        if (s.heel_durability === 2) heel.push("Bad");
        if (s.heel_durability === 3) heel.push("Decent");
        if (s.heel_durability === 4) heel.push("Good");
        if (s.heel_durability === 5) heel.push("Very Good");
        return heel.length > 0 ? heel.join(", ") : "-";
      }
    },
    {
      label: "Outsole Durability",
      getValue: (s) => {
        let outsole = [];
        if (s.outsole_durability === 1) outsole.push("Very Bad");
        if (s.outsole_durability === 2) outsole.push("Bad");
        if (s.outsole_durability === 3) outsole.push("Decent");
        if (s.outsole_durability === 4) outsole.push("Good");
        if (s.outsole_durability === 5) outsole.push("Very Good");
        return outsole.length > 0 ? outsole.join(", ") : "-";
      }
    },
    {
      label: "Breathability",
      getValue: (s) => {
        let breathability = [];
        if (s.breathability_durability === 1) breathability.push("Warm");
        if (s.breathability_durability === 3) breathability.push("Moderate");
        if (s.breathability_durability === 4) breathability.push("Good");
        if (s.breathability_durability === 5) breathability.push("Breathable");
        return breathability.length > 0 ? breathability.join(", ") : "-";
      }
    },
    {  
      label: "Width / Fit",
      getValue: (s) => {
        let width =[];
        if (s.width_fit === 1) width.push("Narrow");
        if (s.width_fit === 3) width.push("Medium");
        if (s.width_fit === 5) width.push("Wide");
        return width.length > 0 ? width.join(", ") : "-";
      }
    },
    { 
      label: "Toebox Width", 
      getValue: (s) => {
        let toebox_width = [];
        if (s.toebox_width === 1) toebox_width.push("Narrow");
        if (s.toebox_width === 3) toebox_width.push("Medium");
        if (s.toebox_width === 5) toebox_width.push("Wide");
        return toebox_width.length > 0 ? toebox_width.join(", ") : "-"; 
      }
    },
    {
      label: "Stiffness",
      getValue: (s) => {
        let stiffness = [];
        if (s.stiffness_scaled === 1) stiffness.push("Flexible");
        if (s.stiffness_scaled === 3) stiffness.push("Moderate");
        if (s.stiffness_scaled === 3) stiffness.push("Stiff");
        return stiffness.length > 0 ? stiffness.join(", ") : "-";
      }
    },
    {
      label: "Torsional Rigidity",
      getValue: (s) => {
        let torsional = [];
        if (s.torsional_rigidity === 1) torsional.push("Flexible");
        if (s.torsional_rigidity === 3) torsional.push("Moderate");
        if (s.torsional_rigidity === 5) torsional.push("Stiff");
        return torsional.length > 0 ? torsional.join(", ") : "-";
      }
    },
    {
      label: "Heel Counter Stiffness",
      getValue: (s) => {
        let heel_counter = [];
        if (s.heel_stiff === 1) heel_counter.push("Flexible");
        if (s.heel_stiff === 3) heel_counter.push("Moderate");
        if (s.heel_stiff === 5) heel_counter.push("Stiff");
        return heel_counter.length > 0 ? heel_counter.join(", ") : "-";
      }
    },
    {
      label: "Lug Depth",
      getValue: (s) => s.lug_dept_mm ? `${s.lug_dept_mm} mm` : "-"
    },
    {
      label: "Waterproofing",
      getValue: (s) => {
        let waterproofing = [];
        if (s.waterproof === 1) waterproofing.push("Waterproof");
        if (s.water_repellent === 1) waterproofing.push("Water Repellent");
        return waterproofing.length > 0 ? waterproofing.join(", ") : "-";
      }
    },
    {
      label: "Plate",
      getValue: (s) => {
        let plate = [];
        if (s.plate_rock_plate === 1) plate.push("Rock Plate");
        if (s.plate_carbon_plate === 1) plate.push("Carbon Plate");
        return plate.length > 0 ? plate.join(", ") : "-";
      }
    },
    {
      label: "Heel Stack",
      getValue: (s) => s.heel_lab_mm ? `${s.heel_lab_mm} mm` : "-" 
    },
    {
      label: "Forefoot",
      getValue: (s) => s.forefoot_lab_mm ? `${s.forefoot_lab_mm} mm` : "-"
    },
    {
      label: "Season",
      getValue: (s) => {
        let season = [];
        if (s.season_summer === 1) season.push("Summer");
        if (s.season_winter === 1) season.push("Winter");
        if (s.season_all === 1) season.push("All");
        return season.length > 0 ? season.join(", ") : "-";
      } 
    },
  ];

  // --- 2. FETCH DATA DARI BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("userToken");

      if (!token) {
        alert("Please login to use the Compare feature.");
        navigate("/login");
        return;
      }

      try {
        // A. Ambil Semua Sepatu (Untuk Modal Add)
        const shoesResponse = await api.get("/api/shoes/", {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        // B. Ambil List Favorit User
        const favResponse = await api.get('/api/favorites/', {
          headers: { 'Authorization': `Token ${token}` }
        });

        // C. Simpan Semua Sepatu untuk Modal
        const data = shoesResponse.data;
        if (data) {
          const shoesList = Array.isArray(data) ? data : data.results || [];
          setAllShoesDb(shoesList);
        }

        // --- LOGIC HYDRATION CERDAS (FIX MASALAH LU) ---
        const savedSimpleList = JSON.parse(localStorage.getItem("compareList")) || [];

        if (savedSimpleList.length > 0) {
          const detailedPromises = savedSimpleList.map(async (simpleShoe) => {
            try {
              // 1. CARI SLUG YANG BENAR PAKE ID
              // Kita cari sepatu ini di daftar lengkap shoesList pake shoe_id
              const refShoe = shoesList.find(s => s.shoe_id === simpleShoe.shoe_id);
              
              // 2. Tentukan Identifier (Prioritas: Slug dari DB > Slug dari LocalStorage > ID)
              const realSlug = refShoe?.slug || simpleShoe.slug;
              const identifier = realSlug || simpleShoe.shoe_id;

              if (!identifier) {
                console.warn("⚠️ Gak nemu slug/id buat:", simpleShoe.name);
                return simpleShoe; 
              }

              // 3. Fetch Detail
              const res = await api.get(`/api/shoes/${identifier}/`, {
                headers: { 'Authorization': `Token ${token}` }
              });
              
              return res.data; // Data LENGKAP (Weight, Drop, dll)

            } catch (err) {
              console.error(`❌ Gagal fetch detail ${simpleShoe.name}:`, err);
              // Fallback: Kalau gagal fetch, coba pake data dari allShoesDb (lumayan lengkap biasanya)
              const backupData = shoesList.find(s => s.shoe_id === simpleShoe.shoe_id);
              return backupData || simpleShoe; 
            }
          });

          const fullDetailedShoes = await Promise.all(detailedPromises);
          setSelectedShoes(fullDetailedShoes);
        } else {
          setSelectedShoes([]);
        }
        // --- 🔥 END LOGIC 🔥 ---

        // Simpan ID Favorit
        if (favResponse.data) {
          const ids = new Set(favResponse.data.map(item => item.shoe_id));
          setFavoriteIds(ids);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("userToken");
            navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]); 

  // --- HANDLERS ---
  const handleAddShoe = (shoe) => {
    if (selectedShoes.length < 5) {
      // Logic Hydration juga bisa diterapkan disini jika data dari modal belum lengkap
      // Tapi biasanya dari allShoesDb (API /api/shoes/) datanya sudah cukup
      const updatedList = [...selectedShoes, shoe];
      
      setSelectedShoes(updatedList);
      setIsModalOpen(false);
      setSearchQuery("");
      
      // Update LocalStorage
      localStorage.setItem("compareList", JSON.stringify(updatedList));
    }
  };

  const handleRemoveShoe = (indexToRemove) => {
    const updatedList = selectedShoes.filter((_, index) => index !== indexToRemove);
    setSelectedShoes(updatedList);
    
    // Update LocalStorage
    localStorage.setItem("compareList", JSON.stringify(updatedList));
  };

  // --- FILTER & SORTING MODAL ---
  let filteredShoes = allShoesDb.filter(
    dbShoe => !selectedShoes.find(s => s.shoe_id === dbShoe.shoe_id) && 
              dbShoe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filteredShoes.sort((a, b) => {
    const isAFav = favoriteIds.has(a.shoe_id);
    const isBFav = favoriteIds.has(b.shoe_id);
    if (isAFav && !isBFav) return -1;
    if (!isAFav && isBFav) return 1;
    return 0;
  });

  // --- FILTER ROW LOGIC ---
  const validRows = SPEC_CONFIG.filter(rowConfig => {
    return selectedShoes.some(shoe => {
      const val = rowConfig.getValue(shoe);
      return val && val !== "-" && val !== "N/A" && (Array.isArray(val) ? val.length > 0 : true);
    });
  });

  // --- CHECK DIFFERENCE LOGIC ---
  const hasDifferences = (rowConfig) => {
    if (selectedShoes.length < 2) return false;
    const firstVal = JSON.stringify(rowConfig.getValue(selectedShoes[0]));
    return selectedShoes.some(s => JSON.stringify(rowConfig.getValue(s)) !== firstVal);
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-gray-50">
        <div className="text-xl font-bold text-[#0a0a5c] animate-pulse">Loading Comparison Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 md:px-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0a0a5c] uppercase tracking-tight">Compare Shoes</h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">Differences are highlighted in color.</p>
        </div>
        <div className="text-sm font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
          {selectedShoes.length} / 5 Slots Used
        </div>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="max-w-7xl mx-auto overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="min-w-[900px]"> 
          
          {/* 1. HEADER ROW */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${Math.max(selectedShoes.length + 1, 2)}, 1fr)` }}>
            <div className="flex flex-col justify-end pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Models</div>

            {selectedShoes.map((shoe, index) => (
              <div key={shoe.shoe_id || index} className="relative bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md group">
                <button 
                  onClick={() => handleRemoveShoe(index)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors z-10 p-1 hover:bg-red-50 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                </button>

                <div className="w-full h-32 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-gray-50 rounded-xl -z-10 scale-90 group-hover:scale-100 transition-transform"></div>
                  {/* Gunakan img_url (dari search) atau mainImage (dari detail) */}
                  <img src={shoe.img_url || shoe.mainImage || "https://placehold.co/100x100?text=No+Image"} alt={shoe.name} className="max-h-full object-contain mix-blend-multiply p-2" />
                </div>
                <h3 className="font-bold text-[#0a0a5c] text-sm md:text-base leading-tight line-clamp-2">{shoe.name || shoe.model}</h3>
                <p className="text-xs text-gray-500 uppercase mt-1 font-semibold tracking-wide">{shoe.brand}</p>
                
                <Link to={`/shoe/${shoe.slug}`} className="mt-3 text-[10px] font-bold text-white bg-[#0a0a5c] px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors">VIEW DETAILS</Link>
              </div>
            ))}

            {selectedShoes.length < 5 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[240px] border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50 hover:bg-white hover:border-orange-400 transition-all cursor-pointer group" onClick={() => setIsModalOpen(true)}>
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all mb-3 border border-gray-200 group-hover:border-orange-500">
                  <span className="text-3xl font-light mb-1">+</span>
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-orange-500 uppercase tracking-wider">Add Shoe</span>
              </div>
            )}

            {Array.from({ length: Math.max(0, 4 - selectedShoes.length) }).map((_, i) => (<div key={`spacer-${i}`} className="hidden"></div>))}
          </div>

          {/* 2. DATA ROWS */}
          <div className="flex flex-col gap-1">
            {validRows.map((rowConfig, idx) => {
              const isDifferent = hasDifferences(rowConfig); 

              return (
                <div 
                  key={idx} 
                  className={`grid gap-4 items-center py-4 px-2 rounded-lg transition-colors border border-transparent
                    ${isDifferent ? 'bg-orange-50 border-orange-100' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30')}
                  `}
                  style={{ gridTemplateColumns: `200px repeat(${Math.max(selectedShoes.length + 1, 2)}, 1fr)` }}
                >
                  <div className={`pl-4 font-bold text-xs uppercase tracking-wider ${isDifferent ? 'text-orange-600' : 'text-gray-500'}`}>
                    {rowConfig.label}
                  </div>

                  {selectedShoes.map((shoe, sIdx) => {
                    const value = rowConfig.getValue(shoe);
                    return (
                      <div key={sIdx} className="text-center text-sm text-[#0a0a5c] px-2 flex justify-center items-center h-full">
                        {Array.isArray(value) ? (
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {value.length > 0 ? value.map((v, i) => (
                              <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border ${isDifferent ? 'bg-white text-orange-600 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                {v}
                              </span>
                            )) : <span className="text-gray-300">-</span>}
                          </div>
                        ) : (
                          <span className={`font-semibold ${isDifferent ? 'text-black' : ''}`}>{value || <span className="text-gray-300">-</span>}</span>
                        )}
                      </div>
                    );
                  })}
                  {selectedShoes.length < 5 && <div></div>}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* --- ADD SHOE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a5c]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-[#0a0a5c]">Add to Comparison</h3>
                <p className="text-xs text-gray-500">Your favorites appear at the top.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 transition-colors">✕</button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search by shoe name..." className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0a5c] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              </div>
            </div>
            
            {/* List Result */}
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
              {filteredShoes.length > 0 ? (
                filteredShoes.map(shoe => {
                  const isFav = favoriteIds.has(shoe.shoe_id);
                  return (
                    <div key={shoe.shoe_id} onClick={() => handleAddShoe(shoe)} className={`flex items-center gap-4 p-3 mb-2 rounded-xl border shadow-sm cursor-pointer transition-all group ${isFav ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400' : 'bg-white border-gray-100 hover:border-orange-300 hover:shadow-md'}`}>
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-200 relative">
                          <img src={shoe['img-url'] || shoe.mainImage || "https://placehold.co/100x100?text=No+Image"} alt={shoe.name} className="max-h-full object-contain mix-blend-multiply" />
                          {isFav && <span className="absolute -top-2 -right-2 text-yellow-400 drop-shadow-sm text-lg">★</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-[#0a0a5c] text-sm group-hover:text-orange-600 transition-colors">{shoe.name}</p>
                            {isFav && <span className="text-[10px] bg-yellow-400 text-white px-1.5 py-0.5 rounded font-bold shadow-sm">FAVORITE</span>}
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{shoe.brand}</p>
                      </div>
                      <div className="ml-auto">
                          <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all font-bold">+</button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400"><p>No shoes found.</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}