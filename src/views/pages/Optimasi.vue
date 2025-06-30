<script setup>
import { OptimasiService } from '@/service/OptimasiService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dtPaket = ref();
const dtKurir = ref();
const kurirs = ref([]);
const pakets = ref([]);
const selectedKurirs = ref([]);
const selectedPakets = ref([]);
const filtersPaket = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const filtersKurir = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
//const submitted = ref(false);
const isLoading = ref(false);
const paket_ids = ref([]);
const kurir_ids = ref([]);
//const router = useRouter();

onMounted(() => {
    fetchOptimasi();
});

const fetchOptimasi = async () => {
    isLoading.value = true;
    try {
        const response = await OptimasiService.getDataOptimasi();
        if (response && response.status === 'success' && Array.isArray(response.data.kurirs) && Array.isArray(response.data.pakets)) {
            kurirs.value = response.data.kurirs;
            pakets.value = response.data.pakets;
        } else {
            openToast('error', 'Error', 'Gagal memuat data optimasi.');
            kurirs.value = [];
            pakets.value = [];
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

const getOptimasi = async () => {
    if (selectedPakets.value.length === 0 || selectedKurirs.value.length === 0) {
        openToast('warn', 'Peringatan', 'Silakan pilih paket dan kurir terlebih dahulu.');
        return;
    }

    isLoading.value = true;
    try {
        kurir_ids.value = selectedKurirs.value.map((kurir) => kurir.id);
        paket_ids.value = selectedPakets.value.map((paket) => paket.id);
        const response = await OptimasiService.getOptimasi(kurir_ids.value, paket_ids.value);
        if (response && response.status === 'success') {
            openToast('success', 'Sukses', 'Optimasi berhasil dilakukan.');
            fetchOptimasi();
        } else {
            openToast('error', 'Error', 'Gagal melakukan optimasi.');
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

function openToast(sev, sum, det) {
    toast.add({
        severity: sev,
        summary: sum,
        detail: det,
        life: 3000
    });
}
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <DataTable
                    ref="dtPaket"
                    v-model:selection="selectedPakets"
                    :value="pakets"
                    :loading="isLoading"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filtersPaket"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pakets"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Pilih Paket</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filtersPaket['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="resi" header="No. Resi" sortable style="min-width: 12rem"></Column>
                    <Column field="alamat" header="Alamat" sortable style="min-width: 16rem"></Column>
                </DataTable>
            </div>
            <div class="card">
                <DataTable
                    ref="dtKurir"
                    v-model:selection="selectedKurirs"
                    :value="kurirs"
                    :loading="isLoading"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filtersKurir"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kurirs"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Pilih Kurir</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filtersKurir['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="nama" header="Nama" sortable style="min-width: 12rem"></Column>
                </DataTable>
            </div>
        </div>
        <div class="col-span-12 xl:col-span-6">
            <div class="card">
                <h4 class="m-0 mb-4 font-semibold">Rencana Pengiriman</h4>
                <div class="mb-4">
                    <p class="font-medium">Paket ({{ selectedPakets.length }} terpilih):</p>
                    <ul v-if="selectedPakets.length > 0" class="list-none p-0 mt-2 space-y-1">
                        <li v-for="paket in selectedPakets" :key="paket.id" class="text-gray-700">- {{ paket.resi }}</li>
                    </ul>
                    <p v-else class="text-gray-500 italic text-sm mt-2">Belum ada paket yang dipilih.</p>
                </div>
                <div class="mb-6">
                    <p class="font-medium">Kurir ({{ selectedKurirs.length }} terpilih):</p>
                    <ul v-if="selectedKurirs.length > 0" class="list-none p-0 mt-2 space-y-1">
                        <li v-for="kurir in selectedKurirs" :key="kurir.id" class="text-gray-700">- {{ kurir.nama }}</li>
                    </ul>
                    <p v-else class="text-gray-500 italic text-sm mt-2">Belum ada kurir yang dipilih.</p>
                </div>

                <div class="flex justify-end">
                    <Button label="Optimasi" icon="pi pi-cog" @click="getOptimasi" :disabled="selectedPakets.length === 0 || selectedKurirs.length === 0" />
                </div>
            </div>
        </div>
    </div>
</template>
