import axios from 'axios';

const ML_URL = import.meta.env.VITE_ML_API_URL;

const mlApi = axios.create({
  baseURL: ML_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Fungsi untuk Content-Based (Form Road/Trail)
export const getRecommendations = async (type, payload) => {
  const response = await mlApi.post(`/recommend/${type}`, payload);
  return response.data.data; 
};

// Fungsi untuk Collaborative (Like/Interact) - Maksud Shane
export const sendInteraction = async (userId, shoeId, actionType) => {
  const response = await mlApi.post('/interact', {
    user_id: userId,
    shoe_id: String(shoeId),
    action_type: actionType
  });
  return response.data.data; // Balikan "You Might Also Like"
};

// Fungsi untuk Hybrid Feed (Halaman Depan)
export const getUserFeed = async (userId) => {
  const response = await mlApi.get(`/recommend/feed/${userId}`);
  return response.data.data;
};