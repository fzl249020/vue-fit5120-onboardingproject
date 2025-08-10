import { createApp } from 'vue'
import App from './App.vue'
import router from './router'         // ← add Vue Router 
import './assets/tailwind.css'        // ← add Tailwind CSS

createApp(App)
  .use(router)                        // ← mount Vue Router
  .mount('#app')