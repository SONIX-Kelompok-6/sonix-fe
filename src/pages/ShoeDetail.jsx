import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaHeart, FaRegHeart, FaStar, FaPlus } from "react-icons/fa";
import axios from "axios";

export default function ShoeDetail() {
  const { slug } = useParams();
  const [shoeData, setShoeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  
  // --- GET CURRENT USERNAME ---
  const currentUserEmail = localStorage.getItem("userEmail");
  // Extract name before '@' (e.g., "runner@gmail.com" becomes "runner"), or use "Guest" if not logged in
  const currentUserName = currentUserEmail ? currentUserEmail.split('@')[0] : "Guest";

  useEffect(() => {
    const fetchShoeDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Fetching shoe data for slug:", slug);
        const response = await axios.get(
          `http://localhost:8000/api/shoes/${slug}/`
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

  // --- OPTIMIZED REVIEW SUBMIT ---
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation: Prevent empty submissions
    if (newReview.rating === 0 || newReview.text.trim() === "") {
      alert("Please provide both a rating and a comment.");
      return;
    }

    // 2. Check for login token
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please login first to submit a review.");
      return;
    }

    try {
      // 3. Send data to Django API
      await axios.post(
        "http://localhost:8000/api/add-review/",
        {
          shoe_id: shoeData.shoe_id,
          rating: newReview.rating,
          text: newReview.text,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      // 4. Optimistic Update: Add to UI immediately
      const addedReview = {
        id: Date.now(), // Temporary ID for UI
        user: currentUserName, // Uses the dynamic username
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUserName,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
        text: newReview.text,
        rating: newReview.rating,
      };

      setShoeData({
        ...shoeData,
        reviews: [addedReview, ...(shoeData.reviews || [])],
      });

      // 5. Reset form after success
      setNewReview({ rating: 0, text: "" });
      alert("Review submitted successfully!");

    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    }
  };

  // --- OPTIMIZED TOGGLE FAVORITE ---
  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      alert("Please login first to save this shoe to your favorites.");
      return;
    }

    // 1. Store previous state for rollback if server fails
    const previousStatus = shoeData.isFavorite;

    // 2. Optimistic Update: Change UI immediately
    setShoeData({ ...shoeData, isFavorite: !previousStatus });

    try {
      const response = await axios.post(
        "http://localhost:8000/api/favorites/toggle/", // Ensure this matches your urls.py
        { shoe_id: shoeData.shoe_id },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // 3. Sync with actual server response
      setShoeData({ ...shoeData, isFavorite: response.data.is_favorite });
    } catch (err) {
      console.error("Failed to update favorite:", err);
      
      // 4. Rollback to previous state on error
      setShoeData({ ...shoeData, isFavorite: previousStatus });
      alert("Something went wrong. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">
        {error}
      </div>
    );
  }

  if (!shoeData) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">
        Shoe not found.
      </div>
    );
  }

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
              <h3 className="text-xl font-semibold text-gray-700">
                {shoeData.brand}
              </h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {shoeData.model}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Weight : {shoeData.weight_lab_oz || "-"} oz
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {shoeData.description}
              </p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="text-3xl text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {shoeData.isFavorite ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <div className="flex text-yellow-400 text-2xl">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < Math.floor(shoeData.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-700">
                    {shoeData.rating || 0}
                  </span>
                </div>
                <button className="bg-[#0a0a5c] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors">
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-wider">
            EXPLORE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shoeData.explore?.map((item) => (
              <Link
                to={`/shoe/${item.slug}`}
                key={item.id}
                className="bg-[#e9eef5] rounded-xl overflow-hidden shadow-md border-4 border-orange-300 hover:border-orange-500 transition-all group"
              >
                <div className="p-6 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt="Explore Shoe"
                    className="max-w-full h-auto group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-orange-400 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-gray-800">{currentUserName}</span>
              <div className="flex text-2xl text-white">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer ${star <= newReview.rating ? "text-yellow-300" : "text-gray-200"}`}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                  />
                ))}
              </div>
            </div>
          </div>
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white rounded-b-2xl p-4 shadow-md flex items-center relative"
          >
            <textarea
              className="w-full bg-gray-100 rounded-full py-3 px-6 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your review here . . ."
              rows="1"
              value={newReview.text}
              onChange={(e) =>
                setNewReview({ ...newReview, text: e.target.value })
              }
            ></textarea>
            <button
              type="submit"
              className="absolute right-6 text-gray-500 hover:text-blue-600 text-2xl"
            >
              <FaPlus />
            </button>
          </form>

          <div className="mt-8 space-y-6">
            {shoeData.reviews?.map((review) => (
              <div
                key={review.id}
                className="bg-[#e9eef5] rounded-2xl p-6 shadow-md relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={review.avatar}
                      alt={review.user}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <h4 className="font-bold text-gray-800">{review.user}</h4>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl">
                  {review.text}
                </p>
                <div className="absolute bottom-6 right-8 flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
                  <FaStar className="text-yellow-400" />
                  <span className="font-bold text-gray-700">
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}