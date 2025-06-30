import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000/api/v1/rute',
    withCredentials: true
});

export const RuteService = {
    async getRutes() {
        try {
            const response = await apiClient.get('/');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data rute:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async getRute(id) {
        try {
            const response = await apiClient.get(`/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching rute with id ${id}:`, error);
            throw error;
        }
    }
};
