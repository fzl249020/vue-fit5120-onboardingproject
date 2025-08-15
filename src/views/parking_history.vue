<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Historical Parking Availability</h1>

    <!-- Search -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search (Zone or Street)</label>

      <div class="relative">
        <input
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

      <!-- no-results message -->
      <div
        v-show="showSearchMsg"
        class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        role="alert"
      >
        {{ searchMsg }}
      </div>
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
        <button class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" @click="resetFiltersAndReload">
          Reset Filters
        </button>

        <span class="text-xs text-gray-500 ml-auto">
          Showing <strong>{{ resultsCount }}</strong> / {{ parkingDataAll.length }} bays
        </span>
      </div>
    </div>

    <!-- Map -->
    <div class="relative rounded-xl border bg-white overflow-hidden">
      <div class="absolute left-3 top-3 z-10 flex flex-col rounded shadow overflow-hidden">
        <button class="w-9 h-9 bg-white border-b hover:bg-gray-50" @click="zoomIn">+</button>
        <button class="w-9 h-9 bg-white hover:bg-gray-50" @click="zoomOut">−</button>
      </div>

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
import { getParkingMarkers, checkParkingExists } from '../api/parking'

/* ---------- ENV ---------- */
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

/* ---------- Select options ---------- */
const yearOptions  = [2022, 2023, 2024, 2025].map(y => ({ value: y, label: String(y) }))
const monthOptions = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
]
// Use day NAMES so backend mapping is correct
const dayOptions   = [
  { value: 'Mon', label: 'Mon' }, { value: 'Tue', label: 'Tue' }, { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' }, { value: 'Fri', label: 'Fri' }, { value: 'Sat', label: 'Sat' }, { value: 'Sun', label: 'Sun' }
]

/* ---------- Form ---------- */
const form = reactive({
  keyword: '',
  years: [2025, 2024],
  months: monthOptions.map(m => m.value),
  days: ['Mon','Tue','Wed','Thu','Fri'],
  hour: 9
})
const pad = (n) => String(n).padStart(2, '0')

/* ---------- Flash message ---------- */
const showSearchMsg = ref(false)
const searchMsg = ref('')
let hideTimer = null
function showSearchMessage(msg = 'No results found for your search.') {
  searchMsg.value = msg
  showSearchMsg.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => (showSearchMsg.value = false), 5000)
}
function hideSearchMessage() { if (hideTimer) clearTimeout(hideTimer); showSearchMsg.value = false }

/* ---------- Data ---------- */
const parkingDataAll = reactive([])   // for “/ {{ parkingDataAll.length }} bays”
const resultsCount   = ref(0)
// buffer the most recent fetch until the map is ready
const latestRows = ref([])

/* ---------- Map ---------- */
const mapRef = ref(null)
let map, infoWindow = null, markers = []
const mapsReady = ref(false)
const loadError = ref(false)

function makeMarkerIcon (bgColor = '#EF4444', label = 'P', { size = 28 } = {}) {
  const s = size, r = Math.round(s * 0.5), font = Math.round(s * 0.6)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
      <defs><filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="rgba(0,0,0,0.25)"/></filter></defs>
      <circle cx="${r}" cy="${r}" r="${Math.round(s*0.48)}" fill="${bgColor}" filter="url(#shadow)"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
            font-family="Inter,system-ui,Arial" font-size="${font}" font-weight="700" fill="#fff">
        ${String(label).toUpperCase()}
      </text>
    </svg>`
  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  return { url, scaledSize: new google.maps.Size(s, s), anchor: new google.maps.Point(s/2, s/2) }
}
let ICON_OCCUPIED, ICON_UNOCCUPIED
function initIcons () {
  ICON_OCCUPIED   = makeMarkerIcon('#EF4444', 'P')   // Present (occupied)
  ICON_UNOCCUPIED = makeMarkerIcon('#10B981', 'U')   // Unoccupied
}
function clearMarkers () { markers.forEach(m => m.setMap(null)); markers = [] }

function popupHTML(r) {
  const status = r.status_desc || (r.status_code === 'P' ? 'Present' : 'Unoccupied')
  return `
    <div style="font:13px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;padding:2px 0;">
      <div style="font-weight:600;color:#111827;margin-bottom:2px;">${r.streets || 'Street: N/A'}</div>
      <div style="color:#374151;">Zone: <span style="font-weight:600">${r.zone_number}</span></div>
      <div style="color:${status === 'Present' ? '#DC2626' : '#059669'};font-weight:600;margin-top:2px;">${status}</div>
      <div style="color:#6B7280;margin-top:2px;">${r.status_timestamp || ''}</div>
      ${r.restrictions ? `<div style="color:#6B7280;margin-top:4px;"><small>${r.restrictions}</small></div>` : ''}
    </div>`
}

function drawMarkers(rows) {
  if (!map) return
  console.log('[drawMarkers] rows=', rows.length)
  clearMarkers()
  if (!infoWindow) infoWindow = new google.maps.InfoWindow()
  const bounds = new google.maps.LatLngBounds()

  let placed = 0
  rows.forEach(r => {
    const lat = Number(r.lat)
    const lng = Number(r.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return // skip bad coords

    const icon = (r.status_code === 'P') ? ICON_OCCUPIED : ICON_UNOCCUPIED
    const m = new google.maps.Marker({
      position: { lat, lng },
      map, icon,
      title: `Zone ${r.zone_number} — ${(r.streets||'N/A').split(',')[0]}`
    })
    m.addListener('click', () => {
      infoWindow.setContent(popupHTML(r))
      infoWindow.open({ map, anchor: m })
    })
    markers.push(m)
    bounds.extend({ lat, lng })
    placed++
  })

  resultsCount.value = placed
  if (placed) map.fitBounds(bounds, 60)
  else showSearchMessage('No parking bays matched / valid coordinates.')
}

/* ---------- API calls ---------- */
async function loadDefault() { // AC1
  const rows = await getParkingMarkers()
  console.log('[loadDefault] got', rows.length, 'rows')
  parkingDataAll.splice(0, parkingDataAll.length, ...rows)
  latestRows.value = rows
  if (map) drawMarkers(rows)
}

async function applyFilters() { // AC3
  const rows = await getParkingMarkers({
    years:  form.years,
    months: form.months,
    days:   form.days,            // "Mon,Tue,…"
    hh:     pad(form.hour),
    mm:     '00'
  })
  console.log('[applyFilters] got', rows.length, 'rows')
  latestRows.value = rows
  if (!rows.length) showSearchMessage('No historical records match your current filters.')
  if (map) drawMarkers(rows)
}

async function onSearch () {   // AC2 + AC6
  hideSearchMessage()
  const q = form.keyword?.trim()
  if (!q) return loadDefault()

  if (/^\d+$/.test(q)) { // zone
    const rows = await getParkingMarkers({ zone: Number(q) })
    console.log('[onSearch:zone] got', rows.length, 'rows')
    latestRows.value = rows
    if (!rows.length) showSearchMessage('No bays found for this zone.')
    if (map) drawMarkers(rows)
    return
  }

  // street (optional existence check)
  try {
    const ex = await checkParkingExists({ street: q })
    if (ex && ex.streetExists === false) {
      showSearchMessage('Sorry for the inconvenience. We are currently working on gathering historical data for this specific location.')
      return
    }
  } catch {}

  const rows = await getParkingMarkers({ street: q })
  console.log('[onSearch:street] got', rows.length, 'rows')
  latestRows.value = rows
  if (!rows.length) showSearchMessage('No historical records match your current filters.')
  if (map) drawMarkers(rows)
}

async function resetFiltersAndReload () { // AC7
  form.keyword = ''
  form.years   = [2025, 2024]
  form.months  = monthOptions.map(m => m.value)
  form.days    = ['Mon','Tue','Wed','Thu','Fri']
  form.hour    = 9
  if (infoWindow) infoWindow.close()
  await loadDefault()
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

  // if data already fetched, draw it now
  if (latestRows.value?.length) drawMarkers(latestRows.value)
}

const zoomIn  = () => map && map.setZoom(map.getZoom() + 1)
const zoomOut = () => map && map.setZoom(map.getZoom() - 1)

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  // fetch immediately (don’t block on maps)
  loadDefault().catch(e => console.error('[parking] loadDefault error', e))

  // load maps in parallel
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
  map = null
  infoWindow = null
})
</script>
