<script setup>
import { KurirService } from '@/service/KurirService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const kurirs = ref([]);
const kurirDialog = ref(false);
const deleteKurirDialog = ref(false);
const kurir = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const isLoading = ref(false);

const getStatusProps = (status) => {
    switch (status) {
        case true:
            return { severity: 'success', text: 'Tersedia', icon: 'pi pi-check-circle' };

        case false:
            return { severity: 'info', text: 'Bekerja', icon: 'pi pi-inbox' };

        default:
            // Fallback untuk status yang tidak dikenali
            return { severity: null, text: status, icon: 'pi pi-question-circle' };
    }
};

onMounted(() => {
    fetchKurirs();
});

const fetchKurirs = async () => {
    isLoading.value = true;
    try {
        const response = await KurirService.getKurirs();
        if (response && response.status === 'success' && Array.isArray(response.data)) {
            kurirs.value = response.data;
        } else {
            openToast('error', 'Error', 'Gagal memuat data kurir.');
            kurirs.value = [];
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

function openNew() {
    kurir.value = {};
    submitted.value = false;
    kurirDialog.value = true;
}

function hideDialog() {
    kurirDialog.value = false;
    submitted.value = false;
}

const saveKurir = async () => {
    submitted.value = true;

    if (!kurir?.value.nama?.trim() || !kurir?.value.email?.trim()) {
        return;
    }

    try {
        const response = await KurirService.createKurir(kurir.value);
        openToast(response.status, response.status === 'success' ? 'Berhasil' : 'Gagal', response.message);

        fetchKurirs();
        kurirDialog.value = false;
        kurir.value = {};
    } catch (error) {
        openToast('error', 'Error', error.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
};

function confirmDeleteKurir(prod) {
    kurir.value = prod;
    deleteKurirDialog.value = true;
}

const deleteKurir = async () => {
    const response = await KurirService.deleteKurir(kurir.value.id);
    if (response.status === 'success') {
        deleteKurirDialog.value = false;
        kurir.value = {};
        openToast('success', 'Berhasil', 'Kurir telah dihapus.');
        fetchKurirs();
    } else {
        openToast('error', 'Gagal', response.message || 'Terjadi kesalahan saat menghapus kurir.');
    }
};

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
                </template>

                <template #end>
                    <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                </template>
            </Toolbar>

            <DataTable
                ref="dt"
                :value="kurirs"
                :loading="isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} kurirs"
                export-filename="Data_kurir"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Kurirs</h4>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Search..." />
                        </IconField>
                    </div>
                </template>

                <Column header="#" style="width: 3rem">
                    <template #body="slotProps">
                        {{ (dt.first || 0) + kurirs.indexOf(slotProps.data) + 1 }}
                    </template>
                </Column>
                <Column field="nama" header="Nama" sortable style="min-width: 12rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
                <Column header="Status" sortable style="min-width: 12rem" :exportable="false">
                    <template #body="{ data }">
                        <Tag :severity="getStatusProps(data.status).severity" :value="getStatusProps(data.status).text" :icon="getStatusProps(data.status).icon" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <!-- <Button icon="pi pi-pencil" outlined rounded class="mr-2 p-button-success" @click="editKurir(slotProps.data)" /> -->
                        <Button label="Delete" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteKurir(slotProps.data)" :disabled="slotProps.data.status === false" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="kurirDialog" :style="{ width: '450px' }" header="Kurir Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nama" class="block font-bold mb-3">Nama</label>
                    <InputText id="nama" v-model.trim="kurir.nama" required autofocus :invalid="submitted && !kurir.nama" fluid />
                    <small v-if="submitted && !kurir.nama" class="text-red-500">Nama harus diisi.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model.trim="kurir.email" required autofocus :invalid="submitted && !kurir.email" fluid />
                    <small v-if="submitted && !kurir.email" class="text-red-500">Email harus diisi.</small>
                </div>
                <div>
                    <label for="password" class="block font-bold mb-3">Password</label>
                    <Password id="password" v-model.trim="kurir.password" required autofocus :invalid="submitted && !kurir.password" fluid />
                    <small v-if="submitted && !kurir.password" class="text-red-500">Password harus diisi.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveKurir" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteKurirDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="kurir">
                    Yakin mau hapus <b>{{ kurir.nama }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteKurirDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteKurir" />
            </template>
        </Dialog>
    </div>
</template>
