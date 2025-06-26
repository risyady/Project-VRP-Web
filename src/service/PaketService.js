import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5000/api/v1/paket',
    withCredentials: true
});

export const PaketService = {
    async getPakets() {
        try {
            const response = await apiClient.get('/');
            return response.data;
        } catch (error) {
            console.error('Error saat mengambil data paket:', error.response?.data?.message || error.message);
            throw error;
        }
    },

    async createPaket(paketData) {
        try {
            const response = await apiClient.post('/', {
                nama_penerima: paketData.nama_penerima,
                alamat: paketData.alamat,
                no_penerima: paketData.no_penerima,
                kuantitas: paketData.kuantitas,
                deskripsi: paketData.deskripsi,
                berat: paketData.berat
            });
            return response.data;
        } catch (error) {
            console.error('Error saat membuat user baru:', error.response?.data?.message || error.message);
            throw error;
        }
    }
};
