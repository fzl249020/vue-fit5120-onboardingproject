<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Historic Parking Availability</h1>

    <!-- search bar -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search (Zone or Street)</label>
      <div class="relative">
        <input
          v-model="form.keyword"
          type="text"
          placeholder="e.g., Flinders St"
          class="w-full rounded-lg border px-4 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          @click="onSearch"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Year -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <MultiSelect v-model="form.years" :items="yearOptions" placeholder="Select years" />
        </div>

        <!-- Month -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <MultiSelect v-model="form.months" :items="monthOptions" placeholder="Select months" />
        </div>

        <!-- Day of Week -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
          <MultiSelect v-model="form.days" :items="dayOptions" placeholder="Select days" />
        </div>

        <!-- Time -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <div class="flex items-center gap-2">
            <select v-model.number="form.hour" class="w-20 rounded-lg border px-2 py-2">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ pad(h-1) }}</option>
            </select>
            <span>:</span>
            <select v-model.number="form.minute" class="w-20 rounded-lg border px-2 py-2">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ pad(m-1) }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <button class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" @click="applyFilters">
          Apply Filters
        </button>
        <button class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" @click="resetFilters">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Map -->
    <div class="relative rounded-xl border bg-white overflow-hidden">
      <!-- Zoom controls -->
      <div class="absolute left-3 top-3 z-10 flex flex-col rounded shadow overflow-hidden">
        <button class="w-9 h-9 bg-white border-b hover:bg-gray-50" @click="zoomIn">+</button>
        <button class="w-9 h-9 bg-white hover:bg-gray-50" @click="zoomOut">−</button>
      </div>
      <!-- Map canvas -->
      <div ref="mapRef" class="h-[520px] w-full flex items-center justify-center text-gray-400">
        <span v-if="!mapsReady && !loadError" class="text-sm">Loading map…</span>
        <span v-if="loadError" class="text-sm text-red-500">Map failed to load. Check API key.</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import breadcrumbs from '../components/breadcrumbs.vue'
import MultiSelect from '../components/MultiSelect.vue'

const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' },
  { text: 'Parking History' }
]

// options { value, label }
const yearOptions  = [2022, 2023, 2024, 2025].map(y => ({ value: y, label: String(y) }))
const monthOptions = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
]
const dayOptions   = [
  { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' }, { value: 0, label: 'Sun' }
]

// form state
const form = reactive({
  keyword: '',
  years: [2025, 2023],
  months: monthOptions.map(m => m.value),
  days: [1,2,3,4,5],
  hour: 9,
  minute: 0
})

const pad = (n) => String(n).padStart(2, '0')

const resetFilters = () => {
  form.keyword = ''
  form.years   = [2025]
  form.months  = monthOptions.map(m => m.value)
  form.days    = [1,2,3,4,5]
  form.hour    = 9
  form.minute  = 0
}

const onSearch = () => {
  // TODO: integrate geocoding
}

const applyFilters = () => {
  // TODO: send form to backend or use for frontend filtering
}

// ===== Google Map =====
const mapRef = ref(null)
let map
const mapsReady = ref(false)
const loadError = ref(false)
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

// 只加载一次 Google Maps 脚本
let gmapsPromise
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve()
  if (!GOOGLE_MAPS_KEY) {
    console.warn('Missing VITE_GOOGLE_MAPS_KEY')
    loadError.value = true
    return Promise.reject(new Error('Missing API key'))
  }
  if (!gmapsPromise) {
    gmapsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`
      script.async = true
      script.onerror = () => reject(new Error('Failed to load Google Maps'))
      script.onload = () => resolve()
      document.head.appendChild(script)
    })
  }
  return gmapsPromise
}

function initMap() {
  if (!mapRef.value || !window.google?.maps) return
  map = new window.google.maps.Map(mapRef.value, {
    center: { lat: -37.8136, lng: 144.9631 },
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  })
  mapsReady.value = true

  // dummy markers
  const parkingData = [
    { lat: -37.815, lng: 144.965, street: 'Collins St', zone: 'Z001', status: 'Occupied' },
    { lat: -37.814, lng: 144.963, street: 'Bourke St',  zone: 'Z002', status: 'Unoccupied' }
  ]
  parkingData.forEach(spot => {
    new window.google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: spot.status === 'Occupied' ? 'red' : 'green',
        fillOpacity: 1,
        strokeWeight: 0
      },
      title: `${spot.street} (${spot.zone})`
    })
  })
}

const zoomIn  = () => map && map.setZoom(map.getZoom() + 1)
const zoomOut = () => map && map.setZoom(map.getZoom() - 1)

onMounted(async () => {
  try {
    await loadGoogleMaps()
    initMap()
  } catch (e) {
    loadError.value = true
  }
})

onBeforeUnmount(() => {
  // 释放引用，避免热更新/路由切换的内存泄漏
  map = null
})
</script>
