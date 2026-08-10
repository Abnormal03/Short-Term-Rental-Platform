import axios from 'axios';
import { useAuth } from '@clerk/clerk-react'


const token = async () => {
    const { getToken } = useAuth();
    return await getToken();
}

const api = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: { "Content-Type": "application/json" }
})

console.log('baseURL is:', api.defaults.baseURL)
export default api;
