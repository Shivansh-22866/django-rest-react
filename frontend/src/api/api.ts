import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Django backend
  withCredentials: true, // Allow cookies if using authentication
});

export default api;
