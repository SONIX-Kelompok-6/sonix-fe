import axios from 'axios';

// Ambil URL dari .env
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- BAGIAN INI SAYA AKTIFKAN (UNCOMMENT) ---
// Robot ini wajib nyala biar token "userToken" ikut terbang ke Backend
api.interceptors.request.use(
    (config) => {
        // Ambil token yang disimpan pas Login tadi
        const token = localStorage.getItem("userToken"); 
        
        if (token) {
            // Pasang token di header Authorization
            // Format: "Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
            config.headers.Authorization = `Token ${token}`; 
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;