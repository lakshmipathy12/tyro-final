import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is 401 (Unauthorized) - potentially token expired
        if (error.response && error.response.status === 401) {
            // We might want to trigger logout actions here if we had access to the context
            // For now, we just pass the error through to be handled by the component
        }
        return Promise.reject(error);
    }
);

export default api;
