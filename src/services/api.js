import axios from "axios";

const api = axios.create({
    baseURL: "dws-backend-production-349f.up.railway.app"
});

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    }
);

export default api;