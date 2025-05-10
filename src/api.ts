// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ats-backend-roan.vercel.app/api/v1', 
  // baseURL: 'http://192.168.29.77:8000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
