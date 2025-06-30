import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000/api/v1/rute',
    withCredentials: true
});

export const OptimasiService = {
    async getDataOptimasi() {
        try {
            const response = await apiClient.get('/optimasi');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data optimasi:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getOptimasi(kurirIds, paketIds) {
        try {
            const response = await apiClient.post('/optimasi', {
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
