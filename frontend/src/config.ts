const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (isDev ? `http://${window.location.hostname}:3000` : 'https://mentis-upda.onrender.com');
export const API_URL = `${BACKEND_URL}/api`;
