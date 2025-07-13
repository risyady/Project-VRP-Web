<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const authStore = useAuthStore();
const toast = useToast();

const nama = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const isLoading = ref(false);
const passwordError = ref('');

onMounted(() => {
    if (authStore.user) {
        nama.value = authStore.user.nama;
        email.value = authStore.user.email;
    }
});

const handleUpdateProfile = async () => {
    passwordError.value = '';
    if (password.value && password.value !== password_confirmation.value) {
        passwordError.value = 'Konfirmasi kata sandi tidak cocok.';
        toast.add({ severity: 'error', summary: 'Gagal', detail: passwordError.value, life: 3000 });
        return;
    }

    isLoading.value = true;
    const payload = {
        nama: nama.value
    };

    if (password.value) {
        payload.password = password.value;
    }

    try {
        await authStore.updateProfile(payload);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui.', life: 3000 });
        password.value = '';
        password_confirmation.value = '';
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil.';
        toast.add({ severity: 'error', summary: 'Gagal', detail: errorMessage, life: 3000 });
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Profil Pengguna</h5>
                <p>Perbarui informasi profil dan kata sandi Anda di sini.</p>

                <div class="mt-6">
                    <form @submit.prevent="handleUpdateProfile">
                        <Divider align="left" type="solid">
                            <b>Informasi Akun</b>
                        </Divider>
                        <div class="p-fluid formgrid grid mt-4">
                            <div class="field col-12 md:col-6 mb-3">
                                <label for="nama" class="block font-bold text-900 mb-2">Nama</label>
                                <InputText id="nama" type="text" v-model="nama" />
                            </div>
                            <div class="field col-12 md:col-6">
                                <label for="email" class="block font-bold text-900 mb-2">Email</label>
                                <InputText id="email" type="email" v-model="email" disabled />
                            </div>
                        </div>

                        <Divider align="left" type="solid" class="mt-4">
                            <b>Ubah Kata Sandi</b>
                        </Divider>
                        <p class="text-muted-color mt-4">Isi kolom di bawah ini hanya jika Anda ingin mengubah kata sandi.</p>
                        <div class="p-fluid formgrid grid">
                            <div class="field col-12 md:col-6 mb-3">
                                <label for="password">Kata Sandi Baru</label>
                                <Password id="password" v-model="password" :feedback="false" toggleMask fluid placeholder="Kosongkan jika tidak ingin diubah"></Password>
                            </div>
                            <div class="field col-12 md:col-6">
                                <label for="password_confirmation">Konfirmasi Kata Sandi Baru</label>
                                <Password id="password_confirmation" v-model="password_confirmation" :feedback="false" toggleMask fluid :invalid="!!passwordError"></Password>
                                <small v-if="passwordError" class="p-error">{{ passwordError }}</small>
                            </div>
                        </div>
                        <div class="flex justify-content-end mt-4">
                            <Button label="Simpan Perubahan" type="submit" :loading="isLoading"></Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <Toast />
</template>

<style scoped>
.p-password input {
    width: 100%;
}
</style>
