import axios from 'axios';
import Cookies from 'js-cookie';

let API_BASE_URL = 'http://localhost:3001';

// Em runtime (navegador), aponta sempre para :3001 no mesmo host da página
if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    API_BASE_URL = `${protocol}//${hostname}:3001`;
}

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
