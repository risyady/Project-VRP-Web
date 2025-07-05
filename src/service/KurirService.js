import apiClient from './apiClient';

export const KurirService = {
    async getKurirs() {
        try {
            const response = await apiClient.get('/user');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data user:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async createKurir(kurirData) {
        try {
            const response = await apiClient.post('/user', {
                nama: kurirData.nama,
                email: kurirData.email,
                password: kurirData.password,
                role: 'kurir'
            });
            return response.data;
        } catch (error) {
            console.error('Error saat membuat user baru:', error.response?.data?.message || error.message);
            throw error;
        }
    }
};
