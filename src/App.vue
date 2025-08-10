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

          <!-- Features 下拉（含二级：Data Insights，自适应左右展开） -->
          <li class="relative group">
            <span tabindex="0" class="inline-flex items-center cursor-pointer hover:opacity-80">
              Features
            </span>

            <!-- 一级面板：允许子菜单溢出 -->
            <div
              class="absolute top-full left-0 z-50 w-64 rounded-xl border bg-white shadow-lg overflow-visible
                     opacity-0 invisible transition
                     group-hover:opacity-100 group-hover:visible
                     group-focus-within:opacity-100 group-focus-within:visible"
            >
              <!-- 二级触发：Data Insights -->
              <div class="relative group">
                <button
                  ref="diBtnRef"
                  type="button"
                  class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer text-left"
                  tabindex="0"
                  @mouseenter="calcSubmenuSide"
                  @focus="calcSubmenuSide"
                >
                  <span class="font-medium text-gray-800">Data Insights</span>
                  <svg class="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 6l6 6-6 6" stroke-width="2"/>
                  </svg>
                </button>

                <!-- 二级面板：📱 窄屏向左；🖥 md+ 根据 openLeft 自动决定 -->
                <div
                  ref="diSubRef"
                  :class="[
                    'absolute top-0 z-50 w-64 rounded-xl border bg-white shadow-lg',
                    'opacity-0 invisible transition group-hover:opacity-100 group-hover:visible',
                    // 窄屏：向左展开
                    'right-full mr-1',
                    // ≥md：根据空间决定方向
                    openLeft ? 'md:right-full md:mr-1 md:left-auto md:ml-0'
                             : 'md:left-full md:ml-1 md:right-auto md:mr-0'
                  ]"
                >
                  <router-link to="/features/car-ownership" class="block px-4 py-3 hover:bg-gray-50">
                    Car Ownership Trends
                  </router-link>
                  <router-link to="/features/cbd-population" class="block px-4 py-3 hover:bg-gray-50">
                    CBD Population Trends
                  </router-link>
                </div>
              </div>

              <!-- 其它功能仍在一级 -->
              <router-link to="/features/parking-history" class="block px-4 py-3 hover:bg-gray-50">
                Parking History
              </router-link>
              <!--
              <router-link to="/features/predictive-forecast" class="block px-4 py-3 hover:bg-gray-50">
                Predictive Forecast
              </router-link>
              -->
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
import { ref, onMounted, onBeforeUnmount } from 'vue'

const route = useRoute()

// 高亮当前路由
const linkClass = (path) => (route.path === path ? 'font-semibold text-gray-900' : 'text-gray-700')

/** —— 二级菜单左右自适应 —— */
const openLeft = ref(false)   // 仅在 ≥md 时使用：true=向左展开
const diBtnRef = ref(null)    // Data Insights 触发按钮
const diSubRef = ref(null)    // 二级菜单容器

function calcSubmenuSide() {
  const btn = diBtnRef.value
  const sub = diSubRef.value
  if (!btn || !sub) return
  const rect = btn.getBoundingClientRect()
  const subWidth = sub.offsetWidth || 256
  // 按右侧剩余空间判断；不足则向左展开
  openLeft.value = rect.right + subWidth + 8 > window.innerWidth
}

function handleResize() {
  calcSubmenuSide()
}

onMounted(() => {
  calcSubmenuSide()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
