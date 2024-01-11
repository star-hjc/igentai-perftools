import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '',
            name: 'HomePage',
            component: () => import('@/pages/HomePage.vue')
        }
    ]
})

export default router
