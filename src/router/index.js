import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Contact from '../views/contact.vue'
import Feature from '../views/feature.vue'
import About from '../views/about.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/contact', component: Contact },
  { path: '/features', component: Feature },
  { path: '/about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
