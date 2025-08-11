<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <!-- <breadcrumbs :items="crumbs" /> -->
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Historic Parking Availability</h1>

    <!-- search bar -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search (Zone or Street)</label>
      <div class="relative">
        <input
          ref="searchInput"
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
import { reactive, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
// import breadcrumbs from '../components/breadcrumbs.vue'
import MultiSelect from '../components/MultiSelect.vue'

// const crumbs = [
//   { text: 'Home', href: '/' },
//   { text: 'Features' },
//   { text: 'Parking History' }
// ]

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

const applyFilters = () => {
  // TODO: send form to backend or use for frontend filtering
}

// ===== Google Map + Places Autocomplete =====
const mapRef = ref(null)
const searchInput = ref(null)
let map, autocomplete
const mapsReady = ref(false)
const loadError = ref(false)
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

// 自定义图标（红 P / 绿 U）
let ICON_OCCUPIED, ICON_UNOCCUPIED
let markers = []

function makeMarkerIcon(bgColor = '#EF4444', label = 'P', { size = 28 } = {}) {
  const s = size
  const r = Math.round(s * 0.5)
  const font = Math.round(s * 0.6)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(0,0,0,0.25)"/>
        </filter>
      </defs>
      <circle cx="${r}" cy="${r}" r="${Math.round(s*0.48)}" fill="${bgColor}" filter="url(#shadow)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
            font-family="Inter,system-ui,Arial" font-size="${font}" font-weight="700" fill="#fff">
        ${String(label).toUpperCase()}
      </text>
    </svg>`
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  return {
    url,
    scaledSize: new google.maps.Size(s, s),
    anchor: new google.maps.Point(s / 2, s / 2),
  }
}

function initIcons() {
  ICON_OCCUPIED   = makeMarkerIcon('#EF4444', 'P') // 红 P
  ICON_UNOCCUPIED = makeMarkerIcon('#10B981', 'U') // 绿 U
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null))
  markers = []
}

/** 根据 status 应用图标 */
function applyParkingMarkers(parkingData = []) {
  if (!map || !window.google?.maps) return
  clearMarkers()
  parkingData.forEach(spot => {
    const isOcc = String(spot.status || '').toLowerCase() === 'occupied'
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      icon: isOcc ? ICON_OCCUPIED : ICON_UNOCCUPIED,
      title: `${spot.street} (${spot.zone}) • ${isOcc ? 'Occupied' : 'Unoccupied'}`
    })
    markers.push(marker)
  })
}

// 只加载一次 Google Maps 脚本（带 places 库，async + weekly）
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&v=weekly&loading=async`
      script.async = true
      script.defer = true
      script.onerror = () => reject(new Error('Failed to load Google Maps'))
      script.onload = () => resolve()
      document.head.appendChild(script)
    })
  }
  return gmapsPromise
}

function initAutocomplete() {
  const input = searchInput.value
  if (!input || !window.google?.maps) return
  if (window.google.maps.places?.Autocomplete) {
    const ac = new google.maps.places.Autocomplete(input, { fields: ['geometry', 'name'] })
    ac.addListener('place_changed', () => {
      const p = ac.getPlace()
      const loc = p?.geometry?.location
      if (loc && map) { map.panTo(loc); map.setZoom(16) }
    })
    autocomplete = ac
  } else {
    console.warn('places.Autocomplete unavailable; using Geocoder button fallback.')
  }
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

  // 绑定自动补全
  initAutocomplete()

  // 初始化自定义图标
  initIcons()

  // 示例数据（后续换成你的后端返回即可）
  const parkingData = [
    { lat: -37.815, lng: 144.965, street: 'Collins St', zone: 'Z001', status: 'Occupied' },
    { lat: -37.814, lng: 144.963, street: 'Bourke St',  zone: 'Z002', status: 'Unoccupied' },
    { lat: -37.816, lng: 144.961, street: 'Elizabeth St',  zone: 'Z003', status: 'occupied' },
    { lat: -37.817, lng: 144.966, street: 'Queen St',  zone: 'Z004', status: 'unoccupied' },
  ]

  // 渲染标记（按 status 应用红P/绿U）
  applyParkingMarkers(parkingData)
}

// Search 按钮兜底：用 Geocoder 把输入文本定位
async function onSearch() {
  const q = form.keyword?.trim()
  if (!q || !map) return
  if (!window.google?.maps?.Geocoder) return
  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ address: q, componentRestrictions: { country: 'AU' } }, (results, status) => {
    if (status === 'OK' && results?.[0]?.geometry?.location) {
      const loc = results[0].geometry.location
      map.panTo(loc); map.setZoom(16)
    }
  })
}

const zoomIn  = () => map && map.setZoom(map.getZoom() + 1)
const zoomOut = () => map && map.setZoom(map.getZoom() - 1)

onMounted(async () => {
  try {
    await loadGoogleMaps()
    await nextTick()
    initMap()
  } catch (e) {
    loadError.value = true
  }
})

onBeforeUnmount(() => {
  clearMarkers()
  map = null
  autocomplete = null
})
</script>
