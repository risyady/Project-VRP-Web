import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_BASE_URL,
    withCredentials: true
});

export const OptimasiService = {
    async getDataOptimasi() {
        try {
            const response = await apiClient.get('/rute/optimasi');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data optimasi:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getOptimasi(kurirIds, paketIds) {
        try {
            const response = await apiClient.post('/rute/optimasi', {
                kurir_ids: kurirIds,
                paket_ids: paketIds
            });
            return response.data;
        } catch (error) {
            console.error('Error saat melakukan optimasi:', error.response?.data?.message || error.message);
            throw error;
        }
    }
};
