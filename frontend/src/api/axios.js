import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// ── Request Interceptor: Attach JWT from localStorage ─────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("tg_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle auth errors globally ──────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear storage and redirect to login
            const isLoginPage = window.location.pathname === "/login";
            if (!isLoginPage) {
                localStorage.removeItem("tg_token");
                localStorage.removeItem("tg_user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
