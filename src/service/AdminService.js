import apiClient from './apiClient';

export const AdminService = {
    async getAdmins() {
        try {
            const response = await apiClient.get('/admin/');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data admin:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async createAdmin(adminData) {
        try {
            const response = await apiClient.post('/admin/', {
                nama: adminData.nama,
                email: adminData.email,
                password: adminData.password,
                role: 'admin'
            });
            return response.data;
        } catch (error) {
            console.error('Error saat membuat admin baru:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async deleteAdmin(adminId) {
        try {
            const response = await apiClient.delete(`/admin/${adminId}`);
            return response.data;
        } catch (error) {
            console.error('Error saat menghapus admin:', error.response?.data?.message || error.message);
            throw error;
        }
    }
};
