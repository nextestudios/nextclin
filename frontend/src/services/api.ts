import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
        ? // em produção: assume frontend em :3000 e backend em :3001 no mesmo host
          window.location.origin.replace(':3000', ':3001')
        : 'http://localhost:3001');

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
