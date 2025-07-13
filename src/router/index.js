import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/authStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue'),
                    meta: { roles: ['superadmin', 'admin', 'kurir'] }
                },
                {
                    path: '/admin',
                    name: 'admin',
                    component: () => import('@/views/pages/Admin.vue'),
                    meta: { roles: ['superadmin'] }
                },
                {
                    path: '/profile',
                    name: 'profile',
                    component: () => import('@/views/pages/Profile.vue'),
                    meta: { roles: ['superadmin', 'admin', 'kurir'] }
                },
                {
                    path: '/kurir',
                    name: 'kurir',
                    component: () => import('@/views/pages/Kurir.vue'),
                    meta: { roles: ['superadmin', 'admin'] }
                },
                {
                    path: '/paket',
                    name: 'paket',
                    component: () => import('@/views/pages/Paket.vue'),
                    meta: { roles: ['superadmin', 'admin'] }
                },
                {
                    path: '/rute',
                    name: 'rute',
                    component: () => import('@/views/pages/Rute.vue'),
                    meta: { roles: ['superadmin', 'admin'] }
                },
                {
                    path: '/optimasi',
                    name: 'optimasi',
                    component: () => import('@/views/pages/Optimasi.vue'),
                    meta: { roles: ['admin'] }
                },
                {
                    path: '/rute/:id/peta',
                    name: 'petaRute',
                    component: () => import('@/views/pages/PetaOptimasi.vue'),
                    props: true,
                    meta: { roles: ['superadmin', 'admin'] }
                },
                {
                    path: '/ekspedisi',
                    name: 'ekspedisi',
                    component: () => import('@/views/pages/Ekspedisi.vue'),
                    props: true,
                    meta: { roles: ['kurir'] }
                }
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next({ name: 'login' });
    } else if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
        next({ name: 'accessDenied' });
    } else {
        next();
    }
});

export default router;
