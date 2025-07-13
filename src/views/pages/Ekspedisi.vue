<script setup>
import { RuteService } from '@/service/RuteService';
import { useToast } from 'primevue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();
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

    let kurirMarker = null;

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (kurirMarker) {
                    kurirMarker.setLatLng([latitude, longitude]);
                } else {
                    kurirMarker = window.L.marker([latitude, longitude], {
                        icon: window.L.divIcon({
                            className: 'marker-icon kurir-icon',
                            iconSize: [25, 25],
                            iconAnchor: [12.5, 12.5]
                        })
                    })
                        .addTo(map.value)
                        .bindPopup('Lokasi saya');

                    allMarkers.push(kurirMarker);
                }
            },
            (error) => {
                console.error('Gagal melacak lokasi:', error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    } else {
        alert('Browser tidak mendukung pelacakan lokasi');
    }

    if (allRoutePolylines.length > 0 || allMarkers.length > 0) {
        let bounds = new window.L.LatLngBounds([]);

        allRoutePolylines.forEach((polyline) => bounds.extend(polyline.getBounds()));
        allMarkers.forEach((marker) => bounds.extend(marker.getLatLng()));

        if (bounds.isValid()) {
            map.value.fitBounds(bounds.pad(0.1));
        }
    }
}

const fetchRuteDetail = async () => {
    isLoading.value = true;
    try {
        const response = await RuteService.kurirRute();
        if (response && response.status === 'success' && response.data) {
            optimasiData.value = {
                rute: [
                    {
                        id: response.data.id,
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

const allPackagesDelivered = computed(() => {
    if (!optimasiData.value || !optimasiData.value.rute || optimasiData.value.rute.length === 0) {
        return false;
    }
    const pakets = optimasiData.value.rute[0].pakets;
    return pakets.every((paket) => !!paket.waktu_tiba);
});

const updatePackageStatus = async (paket) => {
    try {
        if (!paket.waktu_tiba) {
            const response = await RuteService.updateStatusPaket(paket.id);
            if (response && response.status === 'success') {
                openToast('success', 'Berhasil', `Paket ${paket.resi} telah ditandai terkirim.`);
                fetchRuteDetail();
            } else {
                openToast('error', 'Gagal', 'Gagal memperbarui status paket.');
            }
        }
    } catch (error) {
        openToast('error', 'Gagal', 'Tidak dapat terhubung ke server.');
    }
};

const finishRoute = async (Ruteid) => {
    try {
        const response = await RuteService.finishRute(Ruteid);
        if (response && response.status === 'success') {
            openToast('success', 'Berhasil', 'Rute pengiriman telah berhasil diselesaikan.');
            fetchRuteDetail();
        }
    } catch (error) {
        openToast('error', 'Gagal', 'Tidak dapat menyelesaikan rute.');
    }
};

onMounted(() => {
    fetchRuteDetail();
});
</script>

<template>
    <div class="card">
        <Toolbar class="mb-6">
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
                <div v-if="optimasiData.rute.length > 0">
                    <div v-for="(rute, index) in optimasiData.rute" :key="index">
                        <h5 class="font-semibold mb-2">Paket yang harus dikirim</h5>
                        <p class="font-bold text-lg mb-4"><i class="pi pi-user mr-2"></i>{{ rute.kurir }}</p>

                        <div class="space-y-3 max-h-[20rem] overflow-y-auto pr-2 mb-4">
                            <div v-for="paket in rute.pakets" :key="paket.id" class="p-3 border rounded-lg flex items-center justify-between">
                                <div>
                                    <div class="font-medium">{{ paket.resi }}</div>
                                    <div class="text-sm text-gray-600">{{ paket.alamat }}</div>
                                    <Tag v-if="paket.waktu_tiba" severity="success" value="Terkirim" class="mt-2"></Tag>
                                </div>
                                <Button icon="pi pi-check" rounded text severity="success" aria-label="Tandai terkirim" v-tooltip.left="'Tandai terkirim'" @click="updatePackageStatus(paket)" :disabled="!!paket.waktu_tiba" />
                            </div>
                        </div>

                        <Button label="Selesaikan Rute" icon="pi pi-flag-fill" class="w-full" @click="finishRoute(rute.id)" :disabled="!allPackagesDelivered" />
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

.kurir-icon {
    background-color: #ff3030;
}
</style>
