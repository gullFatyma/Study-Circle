import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Har request ke sath automatically token attach ho jayega (agar user login hai)
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("studycircle_user");
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;