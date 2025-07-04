import apiClient from './apiClient';

export const RuteService = {
    async getRutes() {
        try {
            const response = await apiClient.get('/rute');
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
    }
};
