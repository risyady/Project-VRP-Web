import apiClient from './apiClient';

export const DashboardService = {
    async getStats() {
        try {
            const response = await apiClient.get('/dashboard/');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data dashboard:', error.response?.data?.message || error.message);
            throw error;
        }
    }
};
