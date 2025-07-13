<script setup>
import { AdminService } from '@/service/AdminService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dt = ref();
const admins = ref([]);
const adminDialog = ref(false);
const deleteAdminDialog = ref(false);
const admin = ref({});
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const isLoading = ref(false);

onMounted(() => {
    fetchAdmins();
});

const fetchAdmins = async () => {
    isLoading.value = true;
    try {
        const response = await AdminService.getAdmins();
        if (response && response.status === 'success' && Array.isArray(response.data)) {
            admins.value = response.data;
        } else {
            openToast('error', 'Error', 'Gagal memuat data admin.');
            admins.value = [];
        }
    } catch (error) {
        openToast('error', 'Error', 'Tidak dapat terhubung ke server.');
    } finally {
        isLoading.value = false;
    }
};

function openNew() {
    admin.value = {};
    submitted.value = false;
    adminDialog.value = true;
}

function hideDialog() {
    adminDialog.value = false;
    submitted.value = false;
}

const saveAdmin = async () => {
    submitted.value = true;

    if (!admin?.value.nama?.trim() || !admin?.value.email?.trim()) {
        return;
    }

    try {
        const response = await AdminService.createAdmin(admin.value);
        openToast(response.status, response.status === 'success' ? 'Berhasil' : 'Gagal', response.message);

        fetchAdmins();
        adminDialog.value = false;
        admin.value = {};
    } catch (error) {
        openToast('error', 'Error', error.response?.data?.message || 'Terjadi kesalahan pada server.');
    }
};

function confirmDeleteAdmin(prod) {
    admin.value = prod;
    deleteAdminDialog.value = true;
}

const deleteAdmin = async () => {
    const response = await AdminService.deleteAdmin(admin.value.id);
    if (response.status === 'success') {
        deleteAdminDialog.value = false;
        admin.value = {};
        openToast('success', 'Berhasil', 'Admin telah dihapus.');
        fetchAdmins();
    } else {
        openToast('error', 'Gagal', response.message || 'Terjadi kesalahan saat menghapus admin.');
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
                :value="admins"
                :loading="isLoading"
                dataKey="id"
                :paginator="true"
                :rows="10"
                :filters="filters"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                :rowsPerPageOptions="[5, 10, 25]"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} admins"
                export-filename="Data_admin"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <h4 class="m-0">Manage Admins</h4>
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
                        {{ (dt.first || 0) + admins.indexOf(slotProps.data) + 1 }}
                    </template>
                </Column>
                <Column field="nama" header="Nama" sortable style="min-width: 12rem"></Column>
                <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
                <Column :exportable="false" style="min-width: 12rem">
                    <template #body="slotProps">
                        <!-- <Button icon="pi pi-pencil" outlined rounded class="mr-2 p-button-success" @click="editKurir(slotProps.data)" /> -->
                        <Button label="Delete" icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteAdmin(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="adminDialog" :style="{ width: '450px' }" header="Admin Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="nama" class="block font-bold mb-3">Nama</label>
                    <InputText id="nama" v-model.trim="admin.nama" required autofocus :invalid="submitted && !admin.nama" fluid />
                    <small v-if="submitted && !admin.nama" class="text-red-500">Nama harus diisi.</small>
                </div>
                <div>
                    <label for="email" class="block font-bold mb-3">Email</label>
                    <InputText id="email" v-model.trim="admin.email" required autofocus :invalid="submitted && !admin.email" fluid />
                    <small v-if="submitted && !admin.email" class="text-red-500">Email harus diisi.</small>
                </div>
                <div>
                    <label for="password" class="block font-bold mb-3">Password</label>
                    <Password id="password" v-model.trim="admin.password" required autofocus :invalid="submitted && !admin.password" fluid />
                    <small v-if="submitted && !admin.password" class="text-red-500">Password harus diisi.</small>
                </div>
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                <Button label="Save" icon="pi pi-check" @click="saveAdmin" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteAdminDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="admin">
                    Yakin mau hapus <b>{{ admin.nama }}</b
                    >?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteAdminDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteAdmin" />
            </template>
        </Dialog>
    </div>
</template>
