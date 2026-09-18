import axios from 'axios';

// Since we have the Vite proxy set up, we just use /api
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // This ensures cookies are sent with requests (crucial for our JWT auth)
  withCredentials: true,
});

export default api;

