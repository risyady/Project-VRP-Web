<script setup>
import { RuteService } from '@/service/RuteService';
import { useToast } from 'primevue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const route = useRoute();
const optimasiData = ref(null);
const isLoading = ref(true);

function openToast(sev, sum, det) {
    toast.add({
        severity: sev,
        summary: sum,
        detail: det,
        life: 3000
    });
}

const fetchRuteDetail = async (id) => {
    isLoading.value = true;
    try {
        const response = await RuteService.getRute(id);
        if (response && response.status === 'success' && response.data) {
            optimasiData.value = {
                rute: [
                    {
                        kurir: { nama: response.data.kurir },
                        pakets: response.data.rute_detail.map((detail) => detail.paket),
                        polyline: response.data.polyline
                    }
                ]
            };
        } else {
            openToast('error', 'Error', 'Gagal memuat detail rute.');
            optimasiData.value = null;
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server atau rute tidak ditemukan.');
        router.push({ name: 'rute' });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    const ruteId = route.params.id;
    if (ruteId) {
        fetchRuteDetail(ruteId);
    } else {
        openToast('error', 'Error', 'ID Rute tidak valid.');
        router.push({ name: 'rute' });
    }
});

const goBack = () => {
    router.push({ name: 'rute' });
};
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
            <template #start>
                <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" @click="goBack" />
            </template>
            <template #center>
                <h4 class="m-0">Peta Rute Optimasi</h4>
            </template>
        </Toolbar>

        <div v-if="isLoading" class="text-center">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <p>Memuat data...</p>
        </div>

        <div v-else-if="optimasiData && optimasiData.rute" class="grid grid-cols-12 gap-8">
            <div class="col-span-12 lg:col-span-8">
                <div class="p-4 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                    <div class="text-center">
                        <i class="pi pi-map-marker text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500">Placeholder untuk Peta Rute</p>
                        <small class="text-gray-400">Integrasi dengan library peta seperti Leaflet atau Google Maps diperlukan di sini.</small>
                    </div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <h5 class="font-semibold mb-4">Detail Rute Pengiriman</h5>
                <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div v-for="(rute, index) in optimasiData.rute" :key="index" class="p-3 border rounded-lg">
                        <p class="font-bold text-lg mb-2"><i class="pi pi-user mr-2"></i>{{ rute.kurir.nama }}</p>
                        <p class="text-sm text-gray-600 mb-3"><i class="pi pi-box mr-2"></i>{{ rute.pakets.length }} paket</p>
                        <ol class="list-decimal list-inside space-y-1 text-sm">
                            <li v-for="paket in rute.pakets" :key="paket.id">
                                <span class="font-medium">{{ paket.resi }}</span> - {{ paket.alamat }}
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-8">
            <i class="pi pi-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
            <p class="text-xl font-medium">Data Rute Tidak Ditemukan</p>
            <p class="text-gray-500">Gagal memuat detail rute optimasi.</p>
        </div>
    </div>
</template>
