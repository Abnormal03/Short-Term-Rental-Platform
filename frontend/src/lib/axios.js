import axios from 'axios';
const configuredApiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim()
const productionApiBaseURL = 'https://short-term-rental-platform.onrender.com/api/v1'
let apiBaseURL = configuredApiBaseURL || '/api/v1'
if (import.meta.env.PROD && (!configuredApiBaseURL || configuredApiBaseURL.startsWith('/'))) {
    apiBaseURL = productionApiBaseURL
}

const api = axios.create({
    baseURL: apiBaseURL,
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
})

export default api;
