import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'channels',
        name: 'Channels',
        component: () => import('../views/Channels.vue')
      },
      {
        path: 'task-schedule',
        name: 'TaskSchedule',
        component: () => import('../views/TaskSchedule.vue')
      },
      {
        path: 'settlement',
        name: 'Settlement',
        component: () => import('../views/Settlement.vue')
      },
      {
        path: 'results',
        name: 'Results',
        component: () => import('../views/Results.vue')
      },
      {
        path: 'export',
        name: 'Export',
        component: () => import('../views/Export.vue')
      },
      {
        path: 'report-config',
        name: 'ReportConfig',
        component: () => import('../views/ReportConfig.vue')
      },
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('../views/Templates.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
