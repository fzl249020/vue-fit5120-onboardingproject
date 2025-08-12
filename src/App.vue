<template>
  <div class="min-h-screen flex flex-col">
    <!-- top nav bar -->
    <header class="w-full bg-white/95 backdrop-blur border-b sticky top-0 z-50">
      <nav class="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <!-- left logo + title -->
        <router-link to="/" class="flex items-center gap-2">
          <img src="/images/logo.jpg" alt="logo" class="w-7 h-7" />
          <span class="text-lg font-semibold">ParkPulse & Co.</span>
        </router-link>

        <!-- right menu -->
        <ul class="flex items-center gap-6 text-sm">
          <li>
            <router-link to="/" class="hover:opacity-80" :class="linkClass('/')">Home</router-link>
          </li>
          <li>
            <router-link to="/about" class="hover:opacity-80" :class="linkClass('/about')">About Us</router-link>
          </li>

          <!-- Features dropdown (with sub-menu: Data Insights, adaptive left/right expansion) -->
          <li class="relative group">
            <span tabindex="0" class="inline-flex items-center cursor-pointer hover:opacity-80">
              Features
            </span>

            <!-- first-level panel: allows sub-menu overflow -->
            <div
              class="absolute top-full left-0 z-50 w-64 rounded-xl border bg-white shadow-lg overflow-visible
                     opacity-0 invisible transition
                     group-hover:opacity-100 group-hover:visible
                     group-focus-within:opacity-100 group-focus-within:visible"
            >
              <!-- second-level trigger: Data Insights -->
              <div class="relative group/di">
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

                <!-- second-level panel: narrow screens expand left; md+ adapts based on openLeft -->
                <div
                  ref="diSubRef"
                  :class="[
                    'absolute top-0 z-50 w-64 rounded-xl border bg-white shadow-lg',
                    'opacity-0 invisible transition',
                    'group-hover/di:opacity-100 group-hover/di:visible',
                    'group-focus-within/di:opacity-100 group-focus-within/di:visible',
                    'pointer-events-none group-hover/di:pointer-events-auto group-focus-within/di:pointer-events-auto',
                    // narrow screens: expand left
                    'right-full mr-1',
                    // ≥md：based on openLeft
                    openLeft ? 'md:right-full md:mr-1 md:left-auto md:ml-0'
                             : 'md:left-full md:ml-1 md:right-auto md:mr-0'
                  ]"
                >
                  <router-link to="/features/car-ownership" class="block px-4 py-3 hover:bg-gray-50">
                    Car Ownership Trends
                  </router-link>
                 
                </div>
              </div>

              <!-- other features remain in the first level -->
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

          <!-- <li>
            <router-link to="/contact" class="hover:opacity-80" :class="linkClass('/contact')">Contact</router-link>
          </li> -->
        </ul>
      </nav>
    </header>

    <!-- main content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- footer -->
    <footer class="border-t bg-white/90">
      <div class="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500">
        © {{ new Date().getFullYear() }} ParkPulse & Co. — All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const route = useRoute()

// highlight current route
const linkClass = (path) => (route.path === path ? 'font-semibold text-gray-900' : 'text-gray-700')

/** —— second level —— */
const openLeft = ref(false)   // only ≥md ：true=left, false=right
const diBtnRef = ref(null)    // Data Insights trigger button
const diSubRef = ref(null)    // second-level menu container

function calcSubmenuSide() {
  const btn = diBtnRef.value
  const sub = diSubRef.value
  if (!btn || !sub) return
  const rect = btn.getBoundingClientRect()
  const subWidth = sub.offsetWidth || 256
  // judge by the remaining space on the right; if insufficient, expand to the left
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
