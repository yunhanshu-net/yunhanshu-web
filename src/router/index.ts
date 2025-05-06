import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import MainLayout from '@/views/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path:'workspace/:user/:name',
        name:'workspace',
        component: () => import('@/views/workspace/index.vue'),
        meta: { title: '工作空间', icon: 'function' }
      },
      {
        path: '',
        redirect: '/workspace/user/default'
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 云函数平台`
  }
  next()
})

export default router
