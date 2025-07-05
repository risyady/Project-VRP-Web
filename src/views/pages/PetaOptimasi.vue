<script setup>
import { RuteService } from '@/service/RuteService';
import { useToast } from 'primevue';
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
const route = useRoute();
const optimasiData = ref(null);
const isLoading = ref(true);
const map = ref();

function openToast(sev, sum, det) {
    toast.add({
        severity: sev,
        summary: sum,
        detail: det,
        life: 3000
    });
}

const initMap = () => {
    nextTick(() => {
        if (window.L) {
            setupMap();
        } else {
            console.error('Leaflet library is not loaded.');
        }
    });
};

watch(optimasiData, () => {
    if (optimasiData.value) {
        initMap();
        nextTick(() => {
            displayRoute(optimasiData.value);
        });
    }
});

function setupMap() {
    const [lat, lng] = import.meta.env.VITE_DEPOT_COORDS.split(',').map(Number);
    map.value = window.L.map('map-container').setView([lat, lng], 13);

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);
}

function displayRoute(data) {
    let allRoutePolylines = [];
    let allMarkers = [];

    //console.log(data);

    data.rute.forEach((r) => {
        let allCoordsForRoute = [];
        r.polyline.forEach((pointSegment) => {
            if (pointSegment.type === 'LineString') {
                pointSegment.coordinates.forEach((coord) => {
                    allCoordsForRoute.push([coord[1], coord[0]]);
                });
            }
        });

        if (allCoordsForRoute.length > 0) {
            const routePolyline = window.L.polyline(allCoordsForRoute, { color: `#007bff`, weight: 4 }).addTo(map.value);
            allRoutePolylines.push(routePolyline);
        }

        r.pakets.forEach((p) => {
            const lat = p.latitude;
            const lng = p.longitude;

            const iconClass = `marker-icon ${p.waktu_tiba ? 'delivered-icon' : 'shipped-icon'}`;

            const customIcon = window.L.divIcon({
                className: iconClass,
                html: `<span>${p.urutan}</span>`,
                iconSize: [25, 25],
                iconAnchor: [12.5, 12.5]
            });

            const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map.value);
            allMarkers.push(marker);
        });
    });

    const [lat, lng] = import.meta.env.VITE_DEPOT_COORDS.split(',').map(Number);
    const depot = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
            className: 'marker-icon start-icon',
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
        })
    }).addTo(map.value);
    allMarkers.push(depot);

    if (allRoutePolylines.length > 0 || allMarkers.length > 0) {
        let bounds = new window.L.LatLngBounds([]);

        allRoutePolylines.forEach((polyline) => bounds.extend(polyline.getBounds()));
        allMarkers.forEach((marker) => bounds.extend(marker.getLatLng()));

        if (bounds.isValid()) {
            map.value.fitBounds(bounds.pad(0.1));
        }
    }
}

/* function getMarkerClasses(type) {
    const typeStyles = {
        start: 'bg-yellow-500',
        kirim: 'bg-blue-500 ',
        terkirim: 'bg-green-500 '
    };

    return `${typeStyles[type]}`;
} */

const fetchRuteDetail = async (id) => {
    isLoading.value = true;
    try {
        const response = await RuteService.getRute(id);
        if (response && response.status === 'success' && response.data) {
            optimasiData.value = {
                rute: [
                    {
                        kurir: response.data.kurir,
                        pakets: response.data.rute_detail.map((detail) => ({
                            ...detail.paket,
                            urutan: detail.urutan,
                            waktu_tiba: detail.waktu_tiba
                        })),
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
                    <div id="map-container" class="w-full h-full rounded-lg"></div>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4">
                <h5 class="font-semibold mb-4">Detail Rute Pengiriman</h5>
                <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div v-for="(rute, index) in optimasiData.rute" :key="index" class="p-3 border rounded-lg">
                        <p class="font-bold text-lg mb-2"><i class="pi pi-user mr-2"></i>{{ rute.kurir }}</p>
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

<style>
.marker-icon {
    background-color: #007bff;
    color: white;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    border: 2px solid white;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    text-align: center;
    line-height: 25px;
}

.delivered-icon {
    background-color: #28a745;
}
.start-icon {
    background-color: #ffc107;
}

.shipment-icon {
    background-color: #007bff;
}
</style>
