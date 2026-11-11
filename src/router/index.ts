import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { savedLoginSession } from '@/services/authentication'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/properties/:property_id',
      name: 'property',
      component: () => import('../views/PropertyView.vue'),
    },
    {
      path: '/properties/:property_id/neighborhoods/:neighborhood_id/establishments',
      name: 'establishment',
      component: () => import('../views/EstablishmentView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/',
    },
  ],
})

const publicRoutes = new Set(['about', 'login'])

router.beforeEach((to) => {
  const session = savedLoginSession()
  const isPublic = publicRoutes.has(String(to.name))

  if (to.name === 'not-found') return

  if (!session && !isPublic) {
    return { name: 'login', replace: true }
  }

  if (to.name === 'login' && session) {
    return { name: 'home', replace: true }
  }
})

export default router
