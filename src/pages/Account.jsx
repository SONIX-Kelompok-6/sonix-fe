import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    joinDate: "",
    profile: {
      archType: "",
      footWidth: "",
      orthotic: false 
    }
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("userToken");

      // 1. Cek kalau token gak ada, lempar balik ke login
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // 2. Request ke Backend
        // Ganti URL ini sesuai endpoint Django/Backend kamu
        const response = await axios.get('http://localhost:8000/api/user-profile/', {
          headers: { 
            'Authorization': `Token ${token}` 
          }
        });

        const data = response.data;

        // 3. Masukkan data dari backend ke state
        // Pastikan nama field 'data.xxx' sesuai dengan respon JSON backendmu
        setUserData({
          username: data.username,       // misal backend kirim "username"
          email: data.email,             // misal backend kirim "email"
          joinDate: data.date_joined,    // misal backend kirim "date_joined"
          profile: {
            // Asumsi data profil kaki ada di dalam object 'profile' atau flat
            archType: data.profile?.arch_type || "-", 
            footWidth: data.profile?.foot_width || "-",
            orthotic: data.profile?.uses_orthotics || false
          }
        });

      } catch (error) {
        console.error("Gagal ambil data user:", error);
        
        // Opsional: Kalau token expired (401), paksa logout
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("userToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("userToken");
    try {
      if (token) {
        await axios.post('http://localhost:8000/api/logout/', {}, {
          headers: { 'Authorization': `Token ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("userToken");
      navigate("/login");
      window.location.reload();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER TITLE */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Account</h1>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* HEADER GRADIENT */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <img 
                src="https://i.pravatar.cc/150?img=11" 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">{userData.username}</h2>
              <p className="text-blue-100 opacity-90">{userData.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-900/40 text-xs font-medium border border-blue-400/30">
                Member Since: {formatDate(userData.joinDate)}
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* SHOE PROFILE SECTION */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Foot Profile
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Arch Type */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center hover:border-blue-300 transition">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Arch Type</span>
                  <span className="text-lg font-bold text-gray-800">{userData.profile.archType}</span>
                </div>

                {/* Foot Width */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center hover:border-blue-300 transition">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Foot Width</span>
                  <span className="text-lg font-bold text-gray-800">{userData.profile.footWidth}</span>
                </div>

                {/* Orthotic */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center hover:border-blue-300 transition">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Orthotic Use</span>
                  <span className={`text-lg font-bold ${userData.profile.orthotic ? "text-green-600" : "text-gray-600"}`}>
                    {userData.profile.orthotic ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <button 
                    onClick={() => navigate("/create-profile")}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Edit Foot Profile &rarr;
                </button>
              </div>
            </div>

            <hr className="border-gray-200 mb-8" />

            {/* LOGOUT BUTTON */}
            <div className="flex justify-center">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>

          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          RUSH &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}   