import axios from "axios";

const API = axios.create({
    baseURL: "https://resume-screening-platform-6eec.onrender.com"
});

export default API;