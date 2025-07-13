import router from '@/router';
import apiClient from '@/service/apiClient';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => {
        const userItem = localStorage.getItem('user');
        let user = null;

        if (userItem && userItem !== 'undefined') {
            try {
                user = JSON.parse(userItem);
            } catch (e) {
                console.error('Gagal mem-parsing data user dari localStorage, item akan dihapus:', e);
                localStorage.removeItem('user');
            }
        }

        return { user, token: localStorage.getItem('access_token') || null };
    },

    getters: {
        isLoggedIn: (state) => !!state.token && !!state.user,
        userRole: (state) => state.user?.role
    },

    actions: {
        async login(credentials) {
            try {
                const response = await apiClient.post('/auth/login', credentials);
                const responseData = response.data.data;

                if (!responseData || !responseData.access_token || !responseData.user) {
                    throw new Error('Respons login tidak valid dari server.');
                }

                const token = responseData.access_token;
                const userProfile = responseData.user;

                this.token = token;
                localStorage.setItem('access_token', token);

                this.user = userProfile;
                localStorage.setItem('user', JSON.stringify(userProfile));

                await router.push('/');
            } catch (error) {
                this.token = null;
                this.user = null;
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                console.error('Login gagal: ', error.response?.data?.message || error.message);
                throw error;
            }
        },

        async updateProfile(payload) {
            try {
                const response = await apiClient.put('/user/me', payload);
                const updatedUser = response.data;

                if (!updatedUser) {
                    throw new Error('Data pengguna yang diperbarui tidak diterima dari server.');
                }

                this.user = { ...this.user, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(this.user));

                return response.data;
            } catch (error) {
                console.error('Gagal memperbarui profil:', error.response?.data?.message || error.message);
                throw error;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            router.push('/auth/login');
        }
    }
});
