<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Historic Parking Availability</h1>

    <!-- Search -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search (Zone or Street)</label>

      <div class="relative">
        <input
          ref="searchInput"
          v-model="form.keyword"
          type="text"
          placeholder="e.g., Flinders St"
          class="w-full rounded-lg border px-4 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup="hideSearchMessage"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          @click="onSearch"
        >
          Search
        </button>
      </div>

      <!-- no-results message (hidden by default) -->
      <div
        v-show="showSearchMsg"
        class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        role="alert"
      >
        {{ searchMsg }}
      </div>

      <p v-if="searchCenter" class="mt-2 text-xs text-gray-500">
        Filtering within ~{{ Math.round(searchRadius/100)/10 }} km of selected point.
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <MultiSelect v-model="form.years" :items="yearOptions" placeholder="Select years" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <MultiSelect v-model="form.months" :items="monthOptions" placeholder="Select months" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
          <MultiSelect v-model="form.days" :items="dayOptions" placeholder="Select days" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time (hour)</label>
          <div class="flex items-center gap-2">
            <select v-model.number="form.hour" class="w-24 rounded-lg border px-2 py-2">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ pad(h-1) }}:00</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <button class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" @click="applyFilters">
          Apply Filters
        </button>
        <button class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" @click="resetFiltersAndReload" :disabled="loadingAll">
          {{ loadingAll ? 'Resetting…' : 'Reset Filters' }}
        </button>

        <span class="text-xs text-gray-500 ml-auto">
          Showing <strong>{{ resultsCount }}</strong> / {{ parkingDataAll.length }} bays
        </span>
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
import MultiSelect from '../components/MultiSelect.vue'

/* ---------- Select options ---------- */
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

/* ---------- Form ---------- */
const form = reactive({
  keyword: '',
  years: [2025, 2024],
  months: monthOptions.map(m => m.value),
  days: [1,2,3,4,5],
  hour: 9
})
const pad = (n) => String(n).padStart(2, '0')

/* ---------- No-result message ---------- */
const showSearchMsg = ref(false)
const searchMsg = ref('')
let hideTimer = null
function showSearchMessage(msg = 'No results found for your search.') {
  searchMsg.value = msg
  showSearchMsg.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (showSearchMsg.value = false), 5000)
}
function hideSearchMessage() {
  if (hideTimer) clearTimeout(hideTimer)
  showSearchMsg.value = false
}

/* ---------- Data (mock; backend will overwrite) ---------- */
const parkingDataAll = [
  { lat: -37.8150, lng: 144.9650, street: 'Collins St',    zone: 'Z001', status: 'Occupied',   year: 2025, month: 5,  dow: 2, hour: 9  },
  { lat: -37.8140, lng: 144.9630, street: 'Bourke St',     zone: 'Z002', status: 'Unoccupied', year: 2025, month: 5,  dow: 3, hour: 10 },
  { lat: -37.8162, lng: 144.9618, street: 'Elizabeth St',  zone: 'Z003', status: 'occupied',   year: 2024, month: 9,  dow: 4, hour: 9  },
  { lat: -37.8172, lng: 144.9663, street: 'Queen St',      zone: 'Z004', status: 'unoccupied', year: 2024, month: 9,  dow: 1, hour: 11 },
  { lat: -37.8129, lng: 144.9642, street: 'Flinders St',   zone: 'Z005', status: 'Present',    year: 2025, month: 2,  dow: 5, hour: 9  },
  { lat: -37.8137, lng: 144.9690, street: 'Swanston St',   zone: 'Z006', status: 'Unoccupied', year: 2025, month: 2,  dow: 2, hour: 9  },
  { lat: -37.8108, lng: 144.9636, street: 'Spencer St',    zone: 'Z007', status: 'Occupied',   year: 2024, month: 11, dow: 3, hour: 8  },
  { lat: -37.8184, lng: 144.9648, street: 'Exhibition St', zone: 'Z008', status: 'Unoccupied', year: 2025, month: 5,  dow: 1, hour: 9  },
  { lat: -37.8155, lng: 144.9603, street: 'King St',       zone: 'Z009', status: 'Occupied',   year: 2024, month: 9,  dow: 2, hour: 9  },
  { lat: -37.8148, lng: 144.9671, street: 'Russell St',    zone: 'Z010', status: 'Unoccupied', year: 2025, month: 5,  dow: 4, hour: 12 },
]

/* ---------- Map state ---------- */
const mapRef = ref(null)
let map
const mapsReady = ref(false)
const loadError = ref(false)
const resultsCount = ref(0)
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY
const API_BASE = import.meta.env.VITE_API_BASE // 后端基地址（.env 里配置）

// search circle
const searchCenter = ref(null)
const searchRadius = ref(1200) // meters
let radiusCircle = null

/* ---------- Icons / markers / popup ---------- */
let ICON_OCCUPIED, ICON_UNOCCUPIED
let markers = []
let infoWindow = null

function makeMarkerIcon (bgColor = '#EF4444', label = 'P', { size = 28 } = {}) {
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
  return { url, scaledSize: new google.maps.Size(s, s), anchor: new google.maps.Point(s/2, s/2) }
}
function initIcons () {
  ICON_OCCUPIED   = makeMarkerIcon('#EF4444', 'P')
  ICON_UNOCCUPIED = makeMarkerIcon('#10B981', 'U')
}
function clearMarkers () { markers.forEach(m => m.setMap(null)); markers = [] }

function normalizeStatus(raw) {
  const s = String(raw || '').trim().toLowerCase()
  return (s === 'occupied' || s === 'present') ? 'Present' : 'Unoccupied'
}
function formatPopupHTML(spot, normStatus) {
  const status = normStatus ?? normalizeStatus(spot.status)
  return `
    <div style="font:13px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;padding:2px 0;">
      <div style="font-weight:600;color:#111827;margin-bottom:2px;">${spot.street || 'Unknown street'}</div>
      <div style="color:#374151;">Zone: <span style="font-weight:600">${spot.zone || '—'}</span></div>
      <div style="color:${status === 'Present' ? '#DC2626' : '#059669'};font-weight:600;margin-top:2px;">${status}</div>
    </div>`
}
function addMarkers (rows) {
  clearMarkers()
  if (!infoWindow) infoWindow = new google.maps.InfoWindow()
  rows.forEach(spot => {
    const status = normalizeStatus(spot.status)
    const isOcc  = status === 'Present'
    const marker = new google.maps.Marker({
      position: { lat: spot.lat, lng: spot.lng },
      map,
      icon: isOcc ? ICON_OCCUPIED : ICON_UNOCCUPIED,
      title: `${spot.street} (${spot.zone})`
    })
    marker.addListener('click', () => {
      infoWindow.setContent(formatPopupHTML(spot, status))
      infoWindow.open({ map, anchor: marker })
    })
    markers.push(marker)
  })
}

/* ---------- Filtering ---------- */
function toRad (d) { return d * Math.PI / 180 }
function distanceMeters (a, b) {
  const R = 6371000, dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const s1 = Math.sin(dLat/2), s2 = Math.sin(dLng/2)
  const q  = s1*s1 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2
  return 2 * R * Math.asin(Math.sqrt(q))
}
function matchesFilters (spot) {
  if (form.years.length  && !form.years.includes(spot.year))   return false
  if (form.months.length && !form.months.includes(spot.month)) return false
  if (form.days.length   && !form.days.includes(spot.dow))     return false
  if (typeof form.hour === 'number' && spot.hour !== form.hour) return false

  if (form.keyword && form.keyword.trim()) {
    const kw = form.keyword.trim().toLowerCase()
    const ok = (spot.street||'').toLowerCase().includes(kw) || (spot.zone||'').toLowerCase().includes(kw)
    if (!searchCenter.value && !ok) return false
  }
  if (searchCenter.value) {
    const d = distanceMeters({ lat: spot.lat, lng: spot.lng }, searchCenter.value)
    if (d > searchRadius.value) return false
  }
  return true
}
function applyFilters () {
  if (!map) return
  const filtered = parkingDataAll.filter(matchesFilters)
  resultsCount.value = filtered.length
  addMarkers(filtered)

  // radius
  if (searchCenter.value) {
    if (!radiusCircle) {
      radiusCircle = new google.maps.Circle({
        strokeColor: '#3B82F6', strokeOpacity: 0.8, strokeWeight: 1,
        fillColor: '#3B82F6', fillOpacity: 0.08, map,
        center: searchCenter.value, radius: searchRadius.value
      })
    } else {
      radiusCircle.setCenter(searchCenter.value)
      radiusCircle.setRadius(searchRadius.value)
      radiusCircle.setMap(map)
    }
  } else if (radiusCircle) {
    radiusCircle.setMap(null)
  }

  // fit
  if (filtered.length) {
    const bounds = new google.maps.LatLngBounds()
    filtered.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
    if (searchCenter.value) bounds.extend(searchCenter.value)
    map.fitBounds(bounds, 60)
  } else {
    showSearchMessage('No parking bays match the current filters.')
  }
}

/* ---------- Maps loader ---------- */
let gmapsPromise
function loadGoogleMaps () {
  if (window.google?.maps) return Promise.resolve()
  const KEY = GOOGLE_MAPS_KEY || (window.__GMAPS_KEY ?? '')
  if (!KEY) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_KEY'))

  if (!gmapsPromise) {
    gmapsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly`
      s.async = true; s.defer = true
      s.onerror = () => reject(new Error('Failed to load Google Maps'))
      s.onload  = () => {
        const wait = () => (window.google?.maps ? resolve() : setTimeout(wait, 30))
        wait()
      }
      document.head.appendChild(s)
    })
  }
  return gmapsPromise
}

/* ---------- Map init ---------- */
function initMap () {
  if (!mapRef.value || !window.google?.maps) return
  map = new google.maps.Map(mapRef.value, {
    center: { lat: -37.8136, lng: 144.9631 }, zoom: 15,
    mapTypeControl: false, streetViewControl: false, fullscreenControl: false
  })
  mapsReady.value = true
  infoWindow = new google.maps.InfoWindow()
  initIcons()
  applyFilters()

  // click map blank to close info window
  map.addListener('click', () => infoWindow?.close())
}

/* ---------- Search (geocode; API placeholder) ---------- */
async function onSearch () {
  hideSearchMessage()
  const q = form.keyword?.trim()
  if (!map) return
  if (!q) { searchCenter.value = null; applyFilters(); return }

  if (window.google?.maps?.Geocoder) {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: q, componentRestrictions: { country: 'AU' } }, (res, status) => {
      if (status === 'OK' && res?.[0]?.geometry?.location) {
        const loc = res[0].geometry.location
        searchCenter.value = { lat: loc.lat(), lng: loc.lng() }
        map.panTo(searchCenter.value); map.setZoom(15)
        applyFilters()
      } else {
        searchCenter.value = null
        applyFilters()
        showSearchMessage('No results found for your search.')
      }
    })
  } else {
    searchCenter.value = null
    applyFilters()
    showSearchMessage('Search is temporarily unavailable.')
  }
}

/* ---------- Reset & reload all (no filters) ---------- */
const loadingAll = ref(false)
async function resetFiltersAndReload () {
  // 1) reset UI
  form.keyword = ''
  form.years   = [2025, 2024]
  form.months  = monthOptions.map(m => m.value)
  form.days    = [1,2,3,4,5]
  form.hour    = 9
  searchCenter.value = null
  hideSearchMessage()
  if (radiusCircle) { radiusCircle.setMap(null); radiusCircle = null }
  if (infoWindow) infoWindow.close()

  // 2) fetch all without any params
  loadingAll.value = true
  try {
    if (!API_BASE) throw new Error('No API base configured')
    const resp = await fetch(`${API_BASE}/api/parking/bays`, { method: 'GET' })
    if (resp.ok) {
      const data = await resp.json()
      if (Array.isArray(data) && data.length) {
        // cover all data source (keep array reference unchanged for template usage)
        parkingDataAll.splice(0, parkingDataAll.length, ...data)
      } else {
        // empty data
        parkingDataAll.splice(0, parkingDataAll.length)
        clearMarkers()
        resultsCount.value = 0
        showSearchMessage('No parking bays available.')
      }
    } else {
      // non-2xx: keep local mock and show light prompt
      showSearchMessage('Failed to reload all bays (server error).')
    }
  } catch (e) {
    // network/unconfigured API: silently fall back to local mock
    console.warn('Reload all bays failed, using local mock.', e)
  } finally {
    loadingAll.value = false
    // 3) render
    applyFilters()
    // if (parkingDataAll.length) {
    if (parkingDataAll.length) {
      const bounds = new google.maps.LatLngBounds()
      parkingDataAll.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }))
      map.fitBounds(bounds, 60)
    }
  }
}

/* ---------- Map utils ---------- */
const zoomIn  = () => map && map.setZoom(map.getZoom() + 1)
const zoomOut = () => map && map.setZoom(map.getZoom() - 1)

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  try {
    await loadGoogleMaps()
    await nextTick()
    initMap()
  } catch (e) {
    console.error('[Maps load failed]', e)
    loadError.value = true
  }
})
onBeforeUnmount(() => {
  clearMarkers()
  if (radiusCircle) radiusCircle.setMap(null)
  map = null
  infoWindow = null
})
</script>
