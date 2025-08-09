<template>
  <div class="min-h-screen flex flex-col">
    <header class="w-full bg-white/95 backdrop-blur border-b sticky top-0 z-50">
      <nav class="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <!-- 左侧 Logo + 标题 -->
        <router-link to="/" class="flex items-center gap-2">
          <img src="/images/logo.png" alt="logo" class="w-7 h-7" />
          <span class="font-semibold">Melbourne Parking</span>
        </router-link>

        <!-- 右侧菜单 -->
        <ul class="flex items-center gap-6 text-sm">
          <li><router-link to="/" class="hover:opacity-80" :class="linkClass('/')">Home</router-link></li>
          <li><router-link to="/about" class="hover:opacity-80" :class="linkClass('/about')">About Us</router-link></li>
          <li><router-link to="/features" class="hover:opacity-80" :class="linkClass('/features')">Features</router-link></li>
          <li><router-link to="/contact" class="hover:opacity-80" :class="linkClass('/contact')">Contact</router-link></li>
        </ul>
      </nav>
    </header>

    <main class="flex-1">
      <router-view />
    </main>

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
const linkClass = (path) =>
  route.path === path ? 'font-semibold text-gray-900' : 'text-gray-700'
</script>
