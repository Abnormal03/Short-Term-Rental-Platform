// src/hooks/useAxiosAuth.js
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import api from '../lib/axios'

export function useAxiosAuth() {
    const { getToken } = useAuth()

    useEffect(() => {
        // runs before every request — attaches the latest token
        const interceptor = api.interceptors.request.use(async (config) => {
            const token = await getToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })

        // cleanup — remove interceptor when component unmounts
        return () => api.interceptors.request.eject(interceptor)
    }, [getToken])
}