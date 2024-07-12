import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/D3MapView.vue'),
    },
    {
      path: '/taiwan',
      name: 'taiwan',
      component: () => import('../views/TaiwanView.vue'),
    },
    {
      path: '/north-population',
      name: 'north-pop',
      component: () => import('../views/PopView.vue'),
    },
  ],
})

export default router
