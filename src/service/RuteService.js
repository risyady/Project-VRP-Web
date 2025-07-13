import apiClient from './apiClient';

export const RuteService = {
    async getRutes() {
        try {
            const response = await apiClient.get('/rute/');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data rute:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getRute(id) {
        try {
            const response = await apiClient.get(`/rute/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rute with id ${id}:`, error);
            throw error;
        }
    },

    async kurirRute() {
        try {
            const response = await apiClient.get('/rute/aktif');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data rute kurir:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async finishRute(ruteId) {
        try {
            const response = await apiClient.put(`/rute/${ruteId}/selesai`);
            return response.data;
        } catch (error) {
            console.error('Error :', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async updateStatusPaket(paketId) {
        try {
            const response = await apiClient.put(`/rute/${paketId}/paket-kirim`);
            return response.data;
        } catch (error) {
            console.error(`Error updating status for package ${paketId}:`, error.response?.data?.message || error.message);
            throw error;
        }
    }
};
