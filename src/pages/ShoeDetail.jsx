import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar"; // Pastikan path impor Navbar benar
import { FaHeart, FaRegHeart, FaStar, FaPlus } from "react-icons/fa"; // Instal react-icons jika belum: npm install react-icons

export default function ShoeDetail() {
  const { slug } = useParams();
  const [shoeData, setShoeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });

  useEffect(() => {
    // Simulasi fetch data berdasarkan slug
    console.log("Fetching data for slug:", slug);
    setTimeout(() => {
      setShoeData({
        id: 1,
        brand: "Nike",
        model: "Nike Winflo 10",
        weight: "280g",
        description:
          "Nike Winflo 10 is a neutral daily running shoe designed for comfort, versatility, and value. It features a soft foam midsole combined with Nike Air cushioning, delivering a bouncy and responsive ride for everyday runs.",
        rating: 4.9,
        isFavorite: false,
        mainImage: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/97699288-2045-4078-8286-124505188902/winflo-10-road-running-shoes-5Jj7jk.png", // Ganti dengan URL gambar asli
        explore: [
          { id: 2, slug: "nike-pegasus-40-white", image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a0703555-9060-4018-b099-727019859050/pegasus-40-road-running-shoes-tc5058.png" },
          { id: 3, slug: "nike-pegasus-40-teal", image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/44277090-2948-4829-9040-688027004850/pegasus-40-road-running-shoes-tc5058.png" },
          { id: 4, slug: "nike-pegasus-40-blue", image: "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/80760290-6649-4882-8020-557256279607/pegasus-40-road-running-shoes-tc5058.png" },
        ],
        reviews: [
          {
            id: 101,
            user: "Bahlil23",
            avatar: "https://i.pravatar.cc/150?u=Bahlil23", // Ganti dengan avatar asli
            date: "2023-12-29",
            rating: 5.0,
            text: "I've been using the Nike Winflo 10 for about 3 months, running 4-5 times a week. The cushioning feels soft but still responsive, and it gives a nice bounce on easy runs. The shoe feels comfortable straight out of the box, with no major break-in period needed. The upper is breathable and keeps my feet cool even on longer runs.",
          },
          {
            id: 102,
            user: "Khaleed12345",
            avatar: "https://i.pravatar.cc/150?u=Khaleed12345", // Ganti dengan avatar asli
            date: "2024-01-30",
            rating: 4.9,
            text: "This is my first proper running shoe, and I'm very happy with it. The Winflo 10 feels supportive and comfortable, especially for short to medium-distance runs. I like how lightweight it feels compared to regular sneakers. It helps reduce impact on my knees, and I feel more confident running longer distances now. It's a good choice for beginners who want comfort and good value.",
          },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [slug]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting review:", newReview);
    setNewReview({ rating: 0, text: "" });
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Loading...</div>;
  }

  if (!shoeData) {
    return <div className="flex h-screen items-center justify-center text-white bg-[#4a76a8]">Shoe not found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#4a76a8]"> {/* Latar belakang biru utama */}
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Kartu Detail Sepatu Utama */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            {/* Bagian Gambar */}
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-100">
              <img src={shoeData.mainImage} alt={shoeData.model} className="max-w-full h-auto transform hover:scale-105 transition-transform duration-300" />
            </div>

            {/* Bagian Informasi */}
            <div className="md:w-1/2 p-8 flex flex-col justify-center bg-[#e9eef5]">
              <h3 className="text-xl font-semibold text-gray-700">{shoeData.brand}</h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{shoeData.model}</h1>
              <p className="text-lg text-gray-600 mb-4">Weight : {shoeData.weight}</p>
              <p className="text-gray-700 mb-6 leading-relaxed">{shoeData.description}</p>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <button className="text-3xl text-gray-500 hover:text-red-500 transition-colors">
                    {shoeData.isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                  </button>
                  <div className="flex text-yellow-400 text-2xl">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < Math.floor(shoeData.rating) ? "text-yellow-400" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-700">{shoeData.rating}</span>
                </div>
                <button className="bg-[#0a0a5c] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-900 transition-colors">
                  Compare
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian Explore */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-wider">EXPLORE</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shoeData.explore.map((item) => (
              <Link to={`/shoe/${item.slug}`} key={item.id} className="bg-[#e9eef5] rounded-xl overflow-hidden shadow-md border-4 border-orange-300 hover:border-orange-500 transition-all group">
                <div className="p-6 flex items-center justify-center">
                  <img src={item.image} alt="Explore Shoe" className="max-w-full h-auto group-hover:scale-105 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bagian Review */}
        <div className="mt-12">
          {/* Form Input Review */}
          <div className="bg-orange-400 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-gray-800">XisonAmandel213</span>
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
          <form onSubmit={handleReviewSubmit} className="bg-white rounded-b-2xl p-4 shadow-md flex items-center relative">
            <textarea
              className="w-full bg-gray-100 rounded-full py-3 px-6 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your review here . . ."
              rows="1"
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            ></textarea>
            <button type="submit" className="absolute right-6 text-gray-500 hover:text-blue-600 text-2xl">
              <FaPlus />
            </button>
          </form>

          {/* Daftar Review Pengguna */}
          <div className="mt-8 space-y-6">
            {shoeData.reviews.map((review) => (
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