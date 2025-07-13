<script setup>
import { DashboardService } from '@/service/DashboardService';
import { useAuthStore } from '@/stores/authStore';
import Chart from 'primevue/chart';
import { onMounted, ref } from 'vue';

const authStore = useAuthStore();
const stats = ref(null);
const isLoading = ref(true);

const chartData = ref();
const chartOptions = ref();

const setChartData = (data) => {
    const documentStyle = getComputedStyle(document.documentElement);

    chartData.value = {
        labels: ['Terkirim', 'Di Gudang', 'Dalam Pengiriman'],
        datasets: [
            {
                data: [data.paket_terkirim, data.paket_di_gudang, data.paket_dalam_pengiriman],
                backgroundColor: [documentStyle.getPropertyValue('--p-green-500'), documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-green-400'), documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400')]
            }
        ]
    };
};

const setChartOptions = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');

    chartOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
};

onMounted(async () => {
    try {
        const response = await DashboardService.getStats();
        if (response && response.status === 'success') {
            stats.value = response.data;
            if (authStore.userRole === 'admin' || authStore.userRole === 'superadmin') {
                setChartData(response.data);
                setChartOptions();
            }
        }
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
    } finally {
        isLoading.value = false;
    }
});
</script>

<template>
    <div>
        <div class="card mb-8">
            <h4 class="mb-2 text-2xl font-semibold">Dashboard</h4>
            <p class="text-surface-500 dark:text-surface-400">Selamat datang kembali, {{ authStore.user.nama }}!</p>
        </div>

        <div v-if="isLoading" class="card text-center">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <p class="mt-2">Memuat statistik...</p>
        </div>

        <div v-else-if="stats">
            <div v-if="authStore.userRole === 'admin' || authStore.userRole === 'superadmin'" class="grid grid-cols-12 gap-8">
                <div class="col-span-12 xl:col-span-7 flex flex-col gap-4">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 md:col-span-6 card">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-xl font-medium">Total Paket</div>
                                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12"><i class="pi pi-box text-2xl"></i></div>
                            </div>
                            <div class="text-3xl font-bold">{{ stats.total_paket }}</div>
                        </div>
                        <div class="col-span-12 md:col-span-6 card">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-xl font-medium">Paket Terkirim</div>
                                <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 rounded-full w-12 h-12"><i class="pi pi-check-circle text-2xl"></i></div>
                            </div>
                            <div class="text-3xl font-bold">{{ stats.paket_terkirim }}</div>
                        </div>
                        <div class="col-span-12 md:col-span-6 card">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-xl font-medium">Total Kurir</div>
                                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full w-12 h-12"><i class="pi pi-users text-2xl"></i></div>
                            </div>
                            <div class="text-3xl font-bold">{{ stats.total_kurir }}</div>
                            <div class="text-sm text-surface-500 dark:text-surface-400">{{ stats.kurir_tersedia }} tersedia</div>
                        </div>
                        <div class="col-span-12 md:col-span-6 card">
                            <div class="flex items-center justify-between mb-3">
                                <div class="text-xl font-medium">Total Rute</div>
                                <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 rounded-full w-12 h-12"><i class="pi pi-map-marker text-2xl"></i></div>
                            </div>
                            <div class="text-3xl font-bold">{{ stats.total_rute }}</div>
                            <div class="text-sm text-surface-500 dark:text-surface-400">{{ stats.rute_selesai }} selesai</div>
                        </div>
                    </div>
                </div>

                <div class="col-span-12 xl:col-span-5 card flex flex-col">
                    <h5 class="text-xl font-semibold mb-4 self-start">Distribusi Status Paket</h5>
                    <div class="flex-grow flex items-center justify-center">
                        <Chart type="pie" :data="chartData" :options="chartOptions" class="w-full max-w-[25rem]" />
                    </div>
                </div>
            </div>

            <div v-if="authStore.userRole === 'kurir'" class="grid grid-cols-12 gap-8">
                <div class="col-span-12 md:col-span-4 card">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-xl font-medium">Paket Terkirim</div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 rounded-full w-12 h-12"><i class="pi pi-box text-2xl"></i></div>
                    </div>
                    <div class="text-3xl font-bold">{{ stats.kurir_paket_dikirim }}</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">Total sepanjang waktu</div>
                </div>
                <div class="col-span-12 md:col-span-4 card">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-xl font-medium">Rute Selesai</div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full w-12 h-12"><i class="pi pi-flag-fill text-2xl"></i></div>
                    </div>
                    <div class="text-3xl font-bold">{{ stats.kurir_rute_diselesaikan }}</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">Total rute yang telah diselesaikan</div>
                </div>
                <div class="col-span-12 md:col-span-4 card">
                    <div class="flex items-center justify-between mb-3">
                        <div class="text-xl font-medium">Total Waktu</div>
                        <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 rounded-full w-12 h-12"><i class="pi pi-clock text-2xl"></i></div>
                    </div>
                    <div class="text-3xl font-bold">{{ stats.kurir_estimasi_waktu_total }}</div>
                    <div class="text-sm text-surface-500 dark:text-surface-400">Akumulasi waktu estimasi</div>
                </div>
            </div>
        </div>

        <div v-else-if="!isLoading" class="card text-center">
            <i class="pi pi-exclamation-triangle text-yellow-500" style="font-size: 2rem"></i>
            <p class="mt-2">Gagal memuat data dashboard. Silakan coba lagi nanti.</p>
        </div>
    </div>
</template>
