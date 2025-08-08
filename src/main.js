import { createApp } from 'vue'
import App from './App.vue'
import router from './router'         // ← 添加 Vue Router 引入
import './assets/tailwind.css'        // ← 引入 Tailwind 样式

createApp(App)
  .use(router)                        // ← 挂载 Vue Router
  .mount('#app')