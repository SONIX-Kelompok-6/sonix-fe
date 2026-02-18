import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaPlus } from "react-icons/fa";
import { sendInteraction } from "../services/SonixMl"; // 🔥 ML Service is BACK
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useShoes } from "../context/ShoeContext"; 
import Footer from "../components/Footer";

export default function ShoeDetail() {
  const { slug } = useParams();
  const { allShoes, updateShoeState } = useShoes(); 

  // --- 🔥 1. INSTANT STATE INITIALIZATION (SPEED HACK) 🔥 ---
  // Cari data SEBELUM render pertama.
  const [shoeData, setShoeData] = useState(() => {
      // A. Cek Cache Detail (LocalStorage) - Data lengkap
      try {
          const localKey = `shoe_detail_${slug}`;
          const cached = localStorage.getItem(localKey);
          if (cached) return JSON.parse(cached);
      } catch (e) { console.warn(e); }

      // B. Cek Context Global (RAM) - Data basic
      if (allShoes && allShoes.length > 0) {
          const found = allShoes.find(s => 
              s.slug === slug || String(s.shoe_id) === slug || String(s.id) === slug
          );
          if (found) return found;
      }

      return null;
  });

  const [isLoading, setIsLoading] = useState(!shoeData);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });

  // --- LOGIC GUEST NAME ---
  const token = localStorage.getItem("userToken");
  const userId = localStorage.getItem("userId"); // Ambil User ID buat ML
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  const [randomGuestName] = useState(() => {
    const randomId = Math.floor(Math.random() * 10000); 
    return `Runner_${randomId}`; 
  });

  const currentUserName = (() => {
    if (!token) return randomGuestName; 
    if (userName && userName !== "null" && userName !== "undefined" && userName.trim() !== "") {
        return userName; 
    }
    if (userEmail) {
        const nameFromEmail = userEmail.split('@')[0];
        return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    }
    return "User"; 
  })();

  // --- 🔥 2. BACKGROUND FETCH & ML TRIGGER 🔥 ---
  useEffect(() => {
    const syncData = async () => {
      const localDetailKey = `shoe_detail_${slug}`;
      
      try {
        const token = localStorage.getItem("userToken");
        // Request ke server untuk data paling fresh
        const response = await api.get(
          `/api/shoes/${slug}/`,
          { headers: token ? { Authorization: `Token ${token}` } : {} }
        );
        
        const freshData = response.data;
        
        // Update State & Cache & Context
        setShoeData(freshData);
        localStorage.setItem(localDetailKey, JSON.stringify(freshData));

        const updatedGlobalList = allShoes.map(s => 
            s.shoe_id === freshData.shoe_id ? { ...s, ...freshData } : s
        );
        updateShoeState(updatedGlobalList);

        // 🔥 ML TRIGGER: CLICK / VIEW (Implicit Feedback)
        // Kita kirim sinyal bahwa user "tertarik" (click) barang ini
        if (userId && freshData.shoe_id) {
            sendInteraction(userId, freshData.shoe_id, 'click', 1).catch(err => 
                console.warn("[ML] Gagal kirim click data", err)
            );
        }

      } catch (err) {
        console.error("Background sync error:", err);
        if (!shoeData) setError("Oops! The shoe you are looking for could not be found.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) syncData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]); 


  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (newReview.rating === 0 || newReview.text.trim() === "") {
      alert("Please provide both a rating and a comment.");
      return;
    }

    if (!token) {
      alert("Please login first to submit a review.");
      return;
    }

    const addedReview = {
        id: Date.now(), 
        user: currentUserName,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUserName,
        date: "Just now",
        text: newReview.text,
        rating: newReview.rating,
    };

    const currentReviews = shoeData.reviews || [];
    const newTotalReviews = currentReviews.length + 1;
    const currentSumRating = currentReviews.reduce((sum, r) => sum + r.rating, 0);
    const updatedAverage = (currentSumRating + newReview.rating) / newTotalReviews;

    // Optimistic Update
    const updatedShoeData = {
        ...shoeData,
        rating: Number(updatedAverage.toFixed(1)), 
        reviews: [addedReview, ...currentReviews],
    };

    setShoeData(updatedShoeData);
    setNewReview({ rating: 0, text: "" }); 
    localStorage.setItem(`shoe_detail_${slug}`, JSON.stringify(updatedShoeData));

    const updatedGlobalList = allShoes.map(s => 
        s.shoe_id === shoeData.shoe_id ? { ...s, rating: updatedShoeData.rating } : s
    );
    updateShoeState(updatedGlobalList);

    try {
      await api.post(
        "/api/add-review/",
        {
          shoe_id: shoeData.shoe_id,
          rating: newReview.rating,
          text: newReview.text,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      // 🔥 ML TRIGGER: RATE & REVIEW
      if (userId) {
          // Kirim Rating (Explicit Feedback kuat)
          sendInteraction(userId, shoeData.shoe_id, 'rate', newReview.rating).catch(console.warn);
          // Kirim Review (Menandakan engagement tinggi)
          sendInteraction(userId, shoeData.shoe_id, 'review', 1).catch(console.warn);
      }

    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please check your connection.");
    }
  };


  const handleToggleFavorite = async () => {
    if (!token) {
      alert("Please login first to save this shoe to your favorites.");
      return;
    }

    const previousStatus = shoeData.isFavorite;
    const newStatus = !previousStatus;
    const interactionValue = newStatus ? 1 : 0; // 1 = Like, 0 = Unlike (Netral/Dislike)

    // Optimistic Update
    const updatedShoeData = { ...shoeData, isFavorite: newStatus };
    setShoeData(updatedShoeData);
    localStorage.setItem(`shoe_detail_${slug}`, JSON.stringify(updatedShoeData));

    const updatedGlobalList = allShoes.map(s => 
        s.shoe_id === shoeData.shoe_id ? { ...s, isFavorite: newStatus } : s
    );
    updateShoeState(updatedGlobalList); 

    try {
      await api.post(
        "/api/favorites/toggle/",
        { shoe_id: String(shoeData.shoe_id) }, 
        { headers: { Authorization: `Token ${token}` } }
      );

      // 🔥 ML TRIGGER: LIKE
      if (userId) {
          // Kirim Like ke ML.
          // Note: Beberapa model ML mungkin butuh 'unlike' (value 0) atau cuma butuh 'like' (value 1) aja.
          // Di sini kita kirim statusnya.
          sendInteraction(userId, shoeData.shoe_id, 'like', interactionValue).catch(console.warn);
      }

    } catch (err) {
      console.error("Failed to update favorite:", err);
      // Rollback
      setShoeData({ ...shoeData, isFavorite: previousStatus });
      updateShoeState(allShoes); 
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleAddCompare = () => {
    if (!shoeData) return;
    let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

    if (compareList.some((item) => item.shoe_id === shoeData.shoe_id)) {
      alert(`"${shoeData.name || shoeData.model}" is already in the list!`);
      return;
    }
    if (compareList.length >= 5) {
      alert("Max 5 shoes in comparison list!");
      return;
    }

    const shoeToSave = {
        ...shoeData, 
        name: shoeData.name || shoeData.model, 
        img_url: shoeData.img_url || shoeData.mainImage || "https://via.placeholder.com/500",
        slug: slug || shoeData.slug 
    };

    compareList.push(shoeToSave);
    localStorage.setItem("compareList", JSON.stringify(compareList));
    alert(`Successfully added "${shoeToSave.name}" to comparison!`);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Loading...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">{error}</div>;
  if (!shoeData) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Shoe not found.</div>;

  return (
    <div className="min-h-screen bg-[#4a76a8]">
      <Navbar />
      <div className="container mx-auto px-14 pt-35 pb-2">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100">
              <img
                src={shoeData.mainImage || shoeData.img_url || "https://via.placeholder.com/500"} 
                alt={shoeData.model}
                className="w-3/4 max-w-md h-auto object-contain transform hover:scale-105 transition-transform duration-300 drop-shadow-lg"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[#e9eef5]">
              <h3 className="text-xl font-semibold text-gray-700">{shoeData.brand}</h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{shoeData.name || shoeData.model}</h1>
              <p className="text-lg text-gray-600 mb-4">Weight : {shoeData.weight_lab_oz || "-"} oz</p>
              <p className="text-gray-700 mb-6 leading-relaxed">{shoeData.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="text-3xl text-gray-500 hover:text-red-500 transition-all transform hover:scale-110 cursor-pointer focus:outline-none"
                  >
                    {shoeData.isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  </button>
                  <div className="flex text-yellow-400 text-2xl">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.floor(shoeData.rating || 0) ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{shoeData.rating || 0}</span>
                </div>
                <button 
                  onClick={handleAddCompare} 
                  className="bg-[#0a0a5c] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors"
                >
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- TECH SPECS MANUAL LAYOUT --- */}
        <div className="mt-12">
          <h2 className="text-3xl font-black text-white text-center mb-8 tracking-widest uppercase">
            Specification
          </h2>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            {(() => {
              const isTrail = String(shoeData.shoe_id).toUpperCase().startsWith('T');
              const isRoad = !isTrail;

              const renderPace = () => {
                let p = [];
                if (shoeData.pace_daily_running) p.push("Daily");
                if (shoeData.pace_tempo) p.push("Tempo");
                if (shoeData.pace_competition) p.push("Race");
                return p.length > 0 ? p.join(", ") : "-";
              };

              const renderTerrain = () => {
                let t = [];
                if (shoeData.terrain_light) t.push("Light");
                if (shoeData.terrain_moderate) t.push("Moderate");
                if (shoeData.terrain_technical) t.push("Technical");
                return t.length > 0 ? t.join(", ") : "-";
              };

              const renderWaterproof = () => {
                if (shoeData.waterproof) return "Waterproof";
                if (shoeData.water_repellent) return "Water Repellent";
                return "❌";
              };

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* KOLOM 1 */}
                  <div className="space-y-5 lg:border-l lg:border-gray-200 lg:pl-6">
                    {isTrail && (
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Best For Terrain</p>
                        <p className="text-gray-800 font-bold">{renderTerrain()}</p>
                      </div>
                    )}
                    {isRoad && (
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Best For Pace</p>
                        <p className="text-gray-800 font-bold">{renderPace()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Arch Type</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.arch_neutral ? "Neutral" : shoeData.arch_stability ? "Stability" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Lightweight</p>
                      <p className="text-gray-800 font-bold">{shoeData.lightweight ? "✅" : "❌"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Rocker</p>
                      <p className="text-gray-800 font-bold">{shoeData.rocker ? "✅" : "❌"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Removable Insole</p>
                      <p className="text-gray-800 font-bold">{shoeData.removable_insole ? "✅" : "❌"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Plate</p>
                      <p className="text-gray-800 font-bold">{shoeData.plate ? "✅" : "❌"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Strike Pattern</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.strike_heel ? "Heel" : shoeData.strike_mid ? "Midfoot" : shoeData.strike_forefoot ? "Forefoot" : "-"}
                      </p>
                    </div>
                  </div>

                  {/* KOLOM 2 */}
                  <div className="space-y-5 lg:border-l lg:border-gray-200 lg:pl-6">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Heel Stack</p>
                      <p className="text-gray-800 font-bold">{shoeData.heel_lab_mm ? `${shoeData.heel_lab_mm} mm` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Forefoot Stack</p>
                      <p className="text-gray-800 font-bold">{shoeData.forefoot_lab_mm ? `${shoeData.forefoot_lab_mm} mm` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Drop</p>
                      <p className="text-gray-800 font-bold">{shoeData.drop_lab_mm ? `${shoeData.drop_lab_mm} mm` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Weight</p>
                      <p className="text-gray-800 font-bold">{shoeData.weight_lab_oz ? `${shoeData.weight_lab_oz} oz` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Stiffness</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.stiffness_scaled === 1 ? "Flexible" :
                        shoeData.stiffness_scaled === 3 ? "Moderate" :
                        shoeData.stiffness_scaled === 5 ? "Stiff" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Heel Counter Stiffness</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.heel_stiff === 1 ? "Flexible" : 
                        shoeData.heel_stiff === 3 ? "Moderate" : 
                        shoeData.heel_stiff === 5 ? "Stiff" : "-"}
                      </p>
                    </div>
                    {isTrail && (
                      <div>
                        <p className="text-gray-400 text-xs font-bold">Shock Absorption</p>
                        <p className="text-gray-800 font-bold">
                          {shoeData.shock_absorption === 1 ? "Low" :
                          shoeData.shock_absorption === 3 ? "Moderate" :
                          shoeData.shock_absorption === 5 ? "High" : "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* KOLOM 3 */}
                  <div className="space-y-5 lg:border-l lg:border-gray-200 lg:pl-6">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Midsole Softness</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.midsole_softness === 1 ? "Firm" : 
                        shoeData.midsole_softness === 3 ? "Balance" :
                        shoeData.midsole_softness === 5 ? "Soft" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Torsional Rigidity</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.torsional_rigidity === 1 ? "Flexible" : 
                        shoeData.torsional_rigidity === 3 ? "Moderate" : 
                        shoeData.torsional_rigidity === 5 ? "Stiff" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Breathability</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.breathability_scaled === 1 ? "Warm" : 
                        shoeData.breathability_scaled === 3 ? "Moderate" : 
                        shoeData.breathability_scaled === 4 ? "Good" :
                        shoeData.breathability_scaled === 5 ? "Breathable" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Toebox Durability</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.toebox_durability === 1 ? "Very Bad" : 
                        shoeData.toebox_durability === 2 ? "Bad" : 
                        shoeData.toebox_durability === 3 ? "Decent" :
                        shoeData.toebox_durability === 4 ? "Good" :
                        shoeData.toebox_durability === 5 ? "Very Good" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Heel Padding Durability</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.heel_durability === 1 ? "Very Bad" : 
                        shoeData.heel_durability === 2 ? "Bad" : 
                        shoeData.heel_durability === 3 ? "Decent" :
                        shoeData.heel_durability === 4 ? "Good" :
                        shoeData.heel_durability === 5 ? "Very Good" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Outsole Durability</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.outsole_durability === 1 ? "Very Bad" : 
                        shoeData.outsole_durability === 2 ? "Bad" : 
                        shoeData.outsole_durability === 3 ? "Decent" :
                        shoeData.outsole_durability === 4 ? "Good" :
                        shoeData.outsole_durability === 5 ? "Very Good" : "-"}
                      </p>
                    </div>
                    {isTrail && (
                      <div>
                        <p className="text-gray-400 text-xs font-bold">Energy Return</p>
                        <p className="text-gray-800 font-bold">
                          {shoeData.energy_return === 1 ? "Low" :
                          shoeData.energy_return === 3 ? "Moderate" :
                          shoeData.energy_return === 5 ? "High" : "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* KOLOM 4 */}
                  <div className="space-y-5 lg:border-l lg:border-gray-200 lg:pl-6">
                    {isRoad && (
                      <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Best For Pace</p>
                        <p className="text-gray-800 font-bold">{renderPace()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Width Fit</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.width_fit === 1 ? "Narrow" :
                        shoeData.width_fit === 3 ? "Medium" :
                        shoeData.width_fit === 5 ? "Wide" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Toebox Width</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.toebox_width === 1 ? "Narrow" :
                        shoeData.toebox_width === 3 ? "Medium" :
                        shoeData.toebox_width === 5 ? "Wide" : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Season</p>
                      <p className="text-gray-800 font-bold">
                        {shoeData.season_all ? "All Season" : shoeData.season_summer ? "Summer" : "Winter"}
                      </p>
                    </div>
                    {isTrail && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Lug Depth (mm)</p>
                          <p className="text-gray-800 font-bold">{shoeData.lug_dept_mm} mm</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Traction</p>
                          <p className="text-gray-800 font-bold">
                            {shoeData.traction_scaled === 1 ? "Low" : 
                            shoeData.traction_scaled === 3 ? "Moderate" :
                            shoeData.traction_scaled === 5 ? "High" : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">Waterproof</p>
                          <p className="text-gray-800 font-bold text-sm">{renderWaterproof()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-orange-400 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-gray-800">{currentUserName}</span>
              <div className="flex text-2xl text-white">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className={`cursor-pointer ${star <= newReview.rating ? "text-yellow-300" : "text-gray-200"}`} onClick={() => setNewReview({ ...newReview, rating: star })} />
                ))}
              </div>
            </div>
          </div>
          <form onSubmit={handleReviewSubmit} className="bg-white rounded-b-2xl p-4 shadow-md flex items-center relative">
            <textarea
              className="w-full bg-gray-100 rounded-full py-3 px-6 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your review here . . ."
              rows="1"
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            ></textarea>
            <button type="submit" className="absolute right-6 text-gray-500 hover:text-blue-600 text-2xl"><FaPlus /></button>
          </form>

          <div className="mt-8 space-y-6">
            {shoeData.reviews?.map((review) => (
              <div key={review.id} className="bg-[#e9eef5] rounded-2xl p-6 shadow-md relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <h4 className="font-bold text-gray-800">{review.user}</h4>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl">{review.text}</p>
                <div className="absolute bottom-6 right-8 flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                  <FaStar className="text-yellow-400" />
                  <span className="font-bold text-gray-700">{review.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}