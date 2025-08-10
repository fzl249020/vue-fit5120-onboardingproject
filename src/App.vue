<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="w-full bg-white/95 backdrop-blur border-b sticky top-0 z-50">
      <nav class="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <!-- 左侧 Logo + 标题 -->
        <router-link to="/" class="flex items-center gap-2">
          <img src="/images/logo.png" alt="logo" class="w-7 h-7" />
          <span class="text-lg font-semibold">Melbourne Parking</span>
        </router-link>

        <!-- 右侧菜单 -->
        <ul class="flex items-center gap-6 text-sm">
          <li>
            <router-link to="/" class="hover:opacity-80" :class="linkClass('/')">Home</router-link>
          </li>
          <li>
            <router-link to="/about" class="hover:opacity-80" :class="linkClass('/about')">About Us</router-link>
          </li>

          <!-- Features 下拉（无多余箭头，移出后菜单仍可点） -->
          <li class="relative group">
            <span tabindex="0" class="inline-flex items-center cursor-pointer hover:opacity-80">
              Features
            </span>

            <!-- 使用 top-full 贴紧触发区，避免中间“空隙”导致闪退 -->
            <div
              class="absolute top-full left-0 z-50 w-64 rounded-xl border bg-white shadow-lg
                     opacity-0 invisible transition
                     group-hover:opacity-100 group-hover:visible
                     group-focus-within:opacity-100 group-focus-within:visible"
            >
              <router-link to="/features/car-ownership" class="block px-4 py-3 hover:bg-gray-50">
                Car Ownership Trends
              </router-link>
              <router-link to="/features/cbd-population" class="block px-4 py-3 hover:bg-gray-50">
                CBD Population Trends
              </router-link>
              <!-- <router-link to="/features/predictive-forecast" class="block px-4 py-3 hover:bg-gray-50">
                Predictive Forecast
              </router-link> -->
              <router-link to="/features/parking-history" class="block px-4 py-3 hover:bg-gray-50">
                Parking History
              </router-link>

            </div>
          </li>

          <li>
            <router-link to="/contact" class="hover:opacity-80" :class="linkClass('/contact')">Contact</router-link>
          </li>
        </ul>
      </nav>
    </header>

    <!-- 页面内容 -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="border-t bg-white/90">
      <div class="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
        © {{ new Date().getFullYear() }} Melbourne Parking — All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

// 高亮当前路由
const linkClass = (path) => (route.path === path ? 'font-semibold text-gray-900' : 'text-gray-700')
</script>
