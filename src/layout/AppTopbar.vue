<script setup>
import { useLayout } from '@/layout/composables/layout';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';
//import AppConfigurator from './AppConfigurator.vue';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

const menu_profile = ref(null);

const authStore = useAuthStore();

const overlayMenuItems = ref([
    {
        label: 'Data Diri',
        icon: 'pi pi-user',
        command: () => {
            router.push({ name: 'profile' });
        }
    },
    {
        separator: true
    },
    {
        label: 'Log Out',
        icon: 'pi pi-sign-out',
        command: () => {
            authStore.logout();
        }
    }
]);

function onMenuToggle(event) {
    menu_profile.value.toggle(event);
}
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/favicon.ico" alt="Logo" class="w-6 h-6" />
                <span>VRP Solver</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <Menu ref="menu_profile" :model="overlayMenuItems" :popup="true" />
                    <button type="button" class="layout-topbar-action" @click="onMenuToggle">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
