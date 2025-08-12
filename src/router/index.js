import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
// import Contact from '../views/contact.vue'
import Feature from '../views/feature.vue'
import About from '../views/about.vue'

const routes = [
  { path: '/', component: Home },
  // { path: '/contact', component: Contact },
  { path: '/features', component: Feature },
  { path: '/about', component: About },
  { path: '/features/car-ownership', component: () => import('../views/car_ownership.vue') },
  { path: '/features/cbd-population', component: () => import('../views/cbd_population.vue') },
  // { path: '/features/predictive-forecast', component: () => import('../views/predictive_forecast.vue') },
  { path: '/features/parking-history', component: () => import('../views/parking_history.vue') },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
