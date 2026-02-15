import axios from 'axios';

// Ambil URL dari .env tadi
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- TAMBAHKAN KODE INI ---
// Robot pencegat (Interceptor) yang otomatis nempel pas mau nembak API
// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem("userToken"); // Ambil token dari storage
//         if (token) {
//             // Pasang token otomatis di header
//             // Pakai prefix 'Token' atau 'Bearer' sesuai settingan Django lu
//             config.headers.Authorization = `Token ${token}`; 
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

export default api;