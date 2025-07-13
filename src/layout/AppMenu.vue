<script setup>
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const model = computed(() => {
    const allMenus = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/', meta: { roles: ['superadmin', 'admin', 'kurir'] } }]
        },
        {
            label: 'Data Master',
            items: [
                { label: 'Admin', icon: 'pi pi-fw pi-user', to: '/admin', meta: { roles: ['superadmin'] } },
                { label: 'Kurir', icon: 'pi pi-fw pi-id-card', to: '/kurir', meta: { roles: ['superadmin', 'admin'] } },
                { label: 'Paket', icon: 'pi pi-fw pi-clone', to: '/paket', meta: { roles: ['superadmin', 'admin'] } }
            ]
        },
        {
            label: 'Rute',
            items: [
                { label: 'Ekspedisi', icon: 'pi pi-fw pi-map-marker', to: '/ekspedisi', meta: { roles: ['kurir'] } },
                { label: 'Daftar Rute', icon: 'pi pi-fw pi-list', to: '/rute', meta: { roles: ['superadmin', 'admin'] } },
                { label: 'Buat Rute', icon: 'pi pi-fw pi-plus', to: '/optimasi', meta: { roles: ['admin'] } }
            ]
        }
    ];

    const userRole = authStore.userRole;

    return allMenus
        .map((section) => {
            const visibleItems = section.items.filter((item) => item.meta?.roles?.includes(userRole));
            return { ...section, items: visibleItems };
        })
        .filter((section) => section.items.length > 0);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
