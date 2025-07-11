<script setup>
import { PaketService } from '@/service/PaketService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const pakets = ref([]);
const paketDialog = ref(false);
const deletePaketDialog = ref(false);
const deletePaketsDialog = ref(false);
const paket = ref({});
const selectedPakets = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const isLoading = ref(false);

const getStatusProps = (status) => {
    switch (status) {
        case 'berhasil':
            return { severity: 'success', text: 'Berhasil', icon: 'pi pi-check-circle' };

        case 'dalam_pengiriman':
            return { severity: 'warning', text: 'Pengiriman', icon: 'pi pi-truck' };

        case 'di_gudang':
            return { severity: 'info', text: 'Di Gudang', icon: 'pi pi-inbox' };

        case 'gagal':
            return { severity: 'danger', text: 'Gagal', icon: 'pi pi-times-circle' };

        default:
            // Fallback untuk status yang tidak dikenali
            return { severity: null, text: status, icon: 'pi pi-question-circle' };
    }
};

onMounted(() => {
    fetchPakets();
});

const fetchPakets = async () => {
    isLoading.value = true;
    try {
        const response = await PaketService.getPakets();
        if (response && response.status === 'success' && Array.isArray(response.data)) {
            pakets.value = response.data;
        } else {
            openToast('error', 'Error', 'Gagal memuat data paket.');
            pakets.value = [];
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

function openNew() {
    paket.value = {};
    submitted.value = false;
    paketDialog.value = true;
}

function hideDialog() {
    paketDialog.value = false;
    submitted.value = false;
}

const savePaket = async () => {
    submitted.value = true;

    if (!paket?.value.alamat?.trim() || !paket?.value.nama_penerima?.trim() || !paket?.value.no_penerima?.trim() || !paket?.value.kuantitas || !paket?.value.berat) {
        return;
    }

    try {
        if (paket.value.id) {
            // TODO: logika update
            openToast('info', 'Info', 'Fungsi update belum diimplementasikan.');
        } else {
            const response = await PaketService.createPaket(paket.value);
            openToast(response.status, response.status === 'success' ? 'Berhasil' : 'Gagal', response.message);
        }

        fetchPakets();
        paketDialog.value = false;
        paket.value = {};
    } catch (error) {
        openToast('error', 'Error', error.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
};

function editPaket(prod) {
    paket.value = { ...prod };
    paketDialog.value = true;
}

function confirmDeletePaket(prod) {
    paket.value = prod;
    deletePaketDialog.value = true;
}

function deletePaket() {
    //products.value = products.value.filter((val) => val.id !== product.value.id);
    /* deleteKurirDialog.value = false;
    kurir.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Kurir telah dihapus.', life: 3000 }); */
    openToast('info', 'info', 'Fungsi belum diimplementasikan.');
}

function confirmDeleteSelected() {
    deletePaketsDialog.value = true;
}

function deleteSelectedPakets() {
    //products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deletePaketsDialog.value = false;
    selectedPakets.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Paket-paket pilihan telah dihapus.', life: 3000 });
}

function exportCSV() {
    dt.value.exportCSV();
}

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
    <div>
        <div class="card">
            <Toolbar class="mb-6">
                <template #start>
                    <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2 p-button-success" @click="openNew" />
                    <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedPakets || !selectedPakets.length" />
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                v-model:selection="selectedPakets"
                :value="pakets"
                :loading="isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} pakets"
                export-filename="Data_paket"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Pakets</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="resi" header="No. Resi" sortable style="min-width: 12rem"></Column>
                <Column field="nama_penerima" header="Penerima" sortable style="min-width: 12rem"></Column>
                <Column field="alamat" header="Alamat" sortable style="min-width: 12rem"></Column>
                <Column header="Status" sortable style="min-width: 12rem">
                    <template #body="{ data }">
                        <Tag :severity="getStatusProps(data.status).severity" :value="getStatusProps(data.status).text" :icon="getStatusProps(data.status).icon" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2 p-button-success" @click="editPaket(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeletePaket(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="paketDialog" :style="{ width: '450px' }" header="Paket Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="nama_penerima" class="block font-bold mb-3">Penerima</label>
                        <InputText id="nama_penerima" v-model.trim="paket.nama_penerima" required autofocus :invalid="submitted && !paket.nama_penerima" fluid />
                        <small v-if="submitted && !paket.nama_penerima" class="text-red-500">Nama penerima harus diisi.</small>
                    </div>
                    <div class="col-span-6">
                        <label for="no_penerima" class="block font-bold mb-3">No. Penerima</label>
                        <InputText id="no_penerima" v-model.trim="paket.no_penerima" required autofocus :invalid="submitted && !paket.no_penerima" fluid />
                        <small v-if="submitted && !paket.no_penerima" class="text-red-500">No. penerima harus diisi.</small>
                    </div>
                </div>
                <div>
                    <label for="alamat" class="block font-bold mb-3">Alamat</label>
                    <Textarea id="alamat" v-model.trim="paket.alamat" required autofocus :invalid="submitted && !paket.alamat" fluid />
                    <small v-if="submitted && !paket.alamat" class="text-red-500">Alamat harus diisi.</small>
                </div>
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-6">
                        <label for="berat" class="block font-bold mb-3">Berat (gram)</label>
                        <InputNumber id="berat" v-model="paket.berat" required integeronly autofocus :invalid="submitted && !paket.berat" fluid />
                        <small v-if="submitted && !paket.berat" class="text-red-500">Berat harus diisi.</small>
                    </div>
                    <div class="col-span-6">
                        <label for="kuantitas" class="block font-bold mb-3">Kuantitas</label>
                        <InputNumber id="kuantitas" v-model="paket.kuantitas" required integeronly autofocus :invalid="submitted && !paket.kuantitas" fluid />
                        <small v-if="submitted && !paket.kuantitas" class="text-red-500">Kuantitas harus diisi.</small>
                    </div>
                </div>
                <div>
                    <label for="deskripsi" class="block font-bold mb-3">Deskripsi</label>
                    <Textarea id="deskripsi" v-model.trim="paket.deskripsi" fluid />
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="savePaket" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePaketDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="paket">
                    Are you sure you want to delete <b>{{ paket.resi }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletePaketDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deletePaket" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deletePaketsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="paket">Are you sure you want to delete the selected pakets?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deletePaketsDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedPakets" />
            </template>
        </Dialog>
    </div>
</template>
