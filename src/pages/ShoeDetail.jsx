import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaHeart, FaRegHeart, FaStar, FaPlus } from "react-icons/fa";
import api from "../api/axios"; 

export default function ShoeDetail() {
  const { slug } = useParams();
  const [shoeData, setShoeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });

  // --- START UPDATE: LOGIC GUEST NAME ---
  // 1. Cek Token & Email
  const token = localStorage.getItem("userToken");
  const currentUserEmail = localStorage.getItem("userEmail");

  // 2. State untuk menyimpan nama random (dibuat sekali saat komponen mount)
  const [randomGuestName] = useState(() => {
    const randomId = Math.floor(Math.random() * 10000); 
    return `Runner_${randomId}`; 
  });

  // 3. Tentukan nama yang dipakai: Kalau login pakai email, kalau tidak pakai randomGuestName
  const currentUserName = (token && currentUserEmail) 
    ? currentUserEmail.split('@')[0] 
    : randomGuestName;
  // --- END UPDATE ---

  useEffect(() => {
    const fetchShoeDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching shoe data for slug:", slug);
        
        // Mengambil token agar isFavorite tetap sinkron saat refresh
        const token = localStorage.getItem("userToken");

        const response = await api.get(
          `/api/shoes/${slug}/`,
          {
            headers: token ? { Authorization: `Token ${token}` } : {},
          }
        );
        
        setShoeData(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Oops! The shoe you are looking for could not be found.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchShoeDetail();
    }
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (newReview.rating === 0 || newReview.text.trim() === "") {
      alert("Please provide both a rating and a comment.");
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please login first to submit a review.");
      return;
    }

    try {
      await api.post(
        "/api/add-review/",
        {
          shoe_id: shoeData.shoe_id,
          rating: newReview.rating,
          text: newReview.text,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      // --- LOGIKA UPDATE RATING RATA-RATA ---
      const currentReviews = shoeData.reviews || [];
      const newTotalReviews = currentReviews.length + 1;
      const currentSumRating = currentReviews.reduce((sum, r) => sum + r.rating, 0);
      const updatedAverage = (currentSumRating + newReview.rating) / newTotalReviews;

      const addedReview = {
        id: Date.now(),
        user: currentUserName, // Akan menggunakan currentUserName yang sudah logic baru
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUserName,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        text: newReview.text,
        rating: newReview.rating,
      };

      setShoeData({
        ...shoeData,
        // Update angka rating di sebelah ikon hati secara instan
        rating: Number(updatedAverage.toFixed(1)), 
        reviews: [addedReview, ...currentReviews],
      });

      setNewReview({ rating: 0, text: "" });
      alert("Review submitted successfully!");

    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please login first to save this shoe to your favorites.");
      return;
    }
    const previousStatus = shoeData.isFavorite;
    setShoeData({ ...shoeData, isFavorite: !previousStatus });
    try {
      const response = await api.post(
        "/api/favorites/toggle/",
        { shoe_id: shoeData.shoe_id },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setShoeData({ ...shoeData, isFavorite: response.data.is_favorite });
    } catch (err) {
      console.error("Failed to update favorite:", err);
      setShoeData({ ...shoeData, isFavorite: previousStatus });
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleAddCompare = () => {
    if (!shoeData) return;

    // 1. Ambil list yang sudah ada di memori browser
    let compareList = JSON.parse(localStorage.getItem("compareList")) || [];

    // 2. Cek apakah sepatu ini SUDAH ADA? (Cegah Duplikat)
    // Kita pakai shoeData.shoe_id (pastikan backend kirim ini)
    const isExists = compareList.some((item) => item.shoe_id === shoeData.shoe_id);
    if (isExists) {
      alert(`"${shoeData.model}" has already been added to the comparison list!`);
      return;
    }

    // 3. Cek Limit Maksimal 5
    if (compareList.length >= 5) {
      alert("Max 5 shoes in comparison list!");
      return;
    }

    // 4. Siapkan Data yang Mau Disimpan (Sesuaikan dengan struktur yang dipakai di Search.jsx)
    // Pastikan field-field penting terbawa (shoe_id, name/model, brand, image_url, slug)
    const shoeToSave = {
        ...shoeData,
        shoe_id: shoeData.shoe_id,
        name: shoeData.model, // Di detail namanya 'model', tapi di search biasanya 'name', sesuaikan
        brand: shoeData.brand,
        slug: shoeData.slug,
        img_url: shoeData.mainImage, // Sesuaikan key image biar seragam
        // ... field lain yang dirasa perlu buat preview di tabel compare
    };

    // 5. Masukkan ke List
    compareList.push(shoeToSave);

    // 6. Simpan balik ke LocalStorage
    localStorage.setItem("compareList", JSON.stringify(compareList));

    // 7. Feedback
    alert(`Successfully added "${shoeData.model}" to comparison list!`);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Loading...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">{error}</div>;
  if (!shoeData) return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Shoe not found.</div>;

  return (
    <div className="min-h-screen bg-[#4a76a8]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100">
              <img
                src={shoeData.mainImage || "https://via.placeholder.com/500"}
                alt={shoeData.model}
                className="max-w-full h-auto transform hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[#e9eef5]">
              <h3 className="text-xl font-semibold text-gray-700">{shoeData.brand}</h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{shoeData.model}</h1>
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
                <button className="bg-[#0a0a5c] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors">Compare</button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-wider">EXPLORE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shoeData.explore?.map((item) => (
              <Link to={`/shoe/${item.slug}`} key={item.id} className="bg-[#e9eef5] rounded-xl overflow-hidden shadow-md border-4 border-orange-300 hover:border-orange-500 transition-all group">
                <div className="p-6 flex items-center justify-center">
                  <img src={item.image} alt="Explore Shoe" className="max-w-full h-auto group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-orange-400 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Ini akan menampilkan Nama User Asli jika login, atau "Guest_XXXX" jika tidak */}
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
    </div>
  );
}