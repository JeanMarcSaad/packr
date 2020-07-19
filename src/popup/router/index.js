import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/MainView.vue')
  },
  {
    path: '/pack/:id',
    name: 'Pack',
    component: () => import('@/views/PackView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
