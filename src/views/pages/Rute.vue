<script setup>
import { RuteService } from '@/service/RuteService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();
const rutes = ref([]);
const expandedRows = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const isLoading = ref(false);

const getStatusProps = (status) => {
    switch (status) {
        case 'berhasil':
            return { severity: 'success', text: 'Berhasil' };
        case 'dalam_pengiriman':
            return { severity: 'warning', text: 'Pengiriman' };
        case 'di_gudang':
            return { severity: 'info', text: 'Di Gudang' };
        case 'gagal':
            return { severity: 'danger', text: 'Gagal' };
        default:
            return { severity: null, text: status };
    }
};

const getRuteStatusProps = (status) => {
    if (status) {
        return { severity: 'success', text: 'Selesai' };
    } else {
        return { severity: 'warning', text: 'Aktif' };
    }
};

onMounted(() => {
    fetchRutes();
});

const fetchRutes = async () => {
    isLoading.value = true;
    try {
        const response = await RuteService.getRutes();
        if (response && response.status === 'success' && Array.isArray(response.data)) {
            rutes.value = response.data;
        } else {
            openToast('error', 'Error', 'Gagal memuat data rute.');
            rutes.value = [];
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

const openToast = (sev, sum, det) => {
    toast.add({
        severity: sev,
        summary: sum,
        detail: det,
        life: 3000
    });
};

const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const viewOnMap = (ruteData) => {
    router.push({ name: 'petaRute', params: { id: ruteData.id } });
};
</script>

<template>
    <div>
        <div class="card">
            <DataTable
                v-model:expandedRows="expandedRows"
                :value="rutes"
                :loading="isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} rute"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Daftar Rute Pengiriman</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column :expander="true" style="width: 5rem" />
                <Column field="kurir" header="Kurir" sortable style="min-width: 12rem"></Column>
                <Column header="Jumlah Paket" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <i class="pi pi-box mr-2"></i>
                        {{ slotProps.data.rute_detail.length }} Paket
                    </template>
                </Column>
                <Column field="jarak" header="Total Jarak" sortable style="min-width: 10rem">
                    <template #body="slotProps"> {{ (slotProps.data.jarak / 1000).toFixed(2) }} km </template>
                </Column>
                <Column field="estimasi" header="Estimasi Waktu" sortable style="min-width: 10rem"></Column>
                <Column header="Status Rute" sortable style="min-width: 10rem">
                    <template #body="slotProps">
                        <Tag :severity="getRuteStatusProps(slotProps.data.status).severity" :value="getRuteStatusProps(slotProps.data.status).text" />
                    </template>
                </Column>
                <Column field="created_at" header="Tanggal Dibuat" sortable style="min-width: 14rem">
                    <template #body="slotProps">
                        {{ formatDate(slotProps.data.created_at) }}
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 8rem">
                    <template #body="slotProps">
                        <Button label="Lihat Peta" icon="pi pi-map-marker" outlined severity="danger" @click="viewOnMap(slotProps.data)" />
                    </template>
                </Column>

                <template #expansion="slotProps">
                    <div class="p-4 bg-gray-50 dark:bg-gray-800">
                        <h5 class="font-semibold mb-3">Detail Urutan Paket untuk: {{ slotProps.data.kurir }}</h5>
                        <DataTable :value="slotProps.data.rute_detail" dataKey="id" sortField="urutan" :sortOrder="1">
                            <Column field="urutan" header="No. Urut" sortable headerStyle="width:6rem"></Column>
                            <Column field="paket.resi" header="No. Resi" sortable></Column>
                            <Column field="paket.nama_penerima" header="Penerima" sortable></Column>
                            <Column field="paket.alamat" header="Alamat" sortable></Column>
                            <Column header="Status" sortable field="paket.status">
                                <template #body="{ data }">
                                    <Tag :severity="getStatusProps(data.paket.status).severity" :value="getStatusProps(data.paket.status).text" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </template>
            </DataTable>
        </div>
    </div>
</template>
