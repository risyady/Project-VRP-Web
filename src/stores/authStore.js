import router from '@/router';
import axios from 'axios';
import { defineStore } from 'pinia';

const API_URL = 'http://127.0.0.1:5000/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null
    }),

    getters: {
        isLoggedIn: (state) => !!state.user,
        userRole: (state) => state.user?.role || null
    },

    actions: {
        async login(credentials) {
            try {
                const response = await axios.post(`${API_URL}/login`, credentials, {
                    withCredentials: true
                });

                const user = response.data.data;

                this.user = user;
                localStorage.setItem('user', JSON.stringify(user));

                await router.push('/');

                return { success: true };
            } catch (error) {
                console.error('Login gagal: ', error.response?.data?.message || error.message);
                throw error;
            }
        },

        logout() {
            axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

            this.user = null;
            localStorage.removeItem('user');
            router.push('/auth/login');
        }
    }
});
