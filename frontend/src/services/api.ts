import axios from 'axios';
import Cookies from 'js-cookie';

// Para ambiente de produção atual na VPS:
// Frontend:  http://62.171.139.44:3000
// Backend:   http://62.171.139.44:3001
//
// Em desenvolvimento local você pode sobrescrever com NEXT_PUBLIC_API_URL.
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://62.171.139.44:3001';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
