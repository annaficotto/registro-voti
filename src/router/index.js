import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
    },
    {
        path: '/subject/:id',
        name: 'Subject',
        component: () => import('@/views/SubjectView.vue')
    },
    {
        path: '/stats',
        name: 'Stats',
        component: () => import('@/views/StatsView.vue')
    },
    {
        path: '/goal',
        name: 'Goal',
        component: () => import('@/views/GoalView.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue')
    },
    {
        path: '/projection',
        name: 'Projection',
        component: () => import('@/views/ProjectionView.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router