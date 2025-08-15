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

          <li>
            <router-link to="/features/car-ownership" class="hover:opacity-80" :class="linkClass('/about')">Car Ownership Trends</router-link>
          </li>

           <li>
            <router-link to="/features/parking-history" class="hover:opacity-80" :class="linkClass('/about')">Parking History</router-link>
          </li>
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
