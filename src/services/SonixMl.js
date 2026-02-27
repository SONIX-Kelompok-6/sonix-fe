import axios from 'axios';

const ML_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8001';

const mlApi = axios.create({
  baseURL: ML_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Fungsi untuk Content-Based
export const getRecommendations = async (type, payload) => {
  const response = await mlApi.post(`/recommend/${type}`, payload);
  // Kalau backend kirim array langsung ["R1", "R2"], dia ada di response.data
  return response.data; 
};

// Fungsi untuk Collaborative
export const sendInteraction = async (userId, shoeId, actionType, value) => {
  const response = await mlApi.post('/interact', {
    user_id: userId,
    shoe_id: String(shoeId),
    action_type: actionType,
    value: value
  });
  return response.data; 
};

// Fungsi untuk Feed
export const getUserFeed = async (userId) => {
  try {
      const response = await mlApi.get(`/recommend/feed/${userId}`);
      return response.data;
  } catch (error) {
      return [];
  }
};