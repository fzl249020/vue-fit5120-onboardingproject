<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
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
      <p v-if="searchCenter" class="mt-2 text-xs text-gray-500">
        Filtering within ~{{ Math.round(searchRadius/100)/10 }} km of selected point.
      </p>
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
        <button class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" @click="resetFilters">
          Reset Filters
        </button>

        <span class="text-xs text-gray-500 ml-auto"
          >Showing <strong>{{ resultsCount }}</strong> / {{ parkingDataAll.length }} bays</span
        >
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
  years: [2025, 2024],                // default select
  months: monthOptions.map(m => m.value),
  days: [1,2,3,4,5],                  // weekdays
  hour: 9
})
const pad = (n) => String(n).padStart(2, '0')
const resetFilters = () => {
  form.keyword = ''
  form.years   = [2025, 2024]
  form.months  = monthOptions.map(m => m.value)
  form.days    = [1,2,3,4,5]
  form.hour    = 9
  searchCenter.value = null
  applyFilters()
}

/* ---------- Demo data (replace with backend later) ---------- */
const parkingDataAll = [
  // lat/lng 大约在 CBD；额外增加 year/month/dow/hour/status 用于筛选演示
  { lat: -37.8150, lng: 144.9650, street: 'Collins St',   zone: 'Z001', status: 'Occupied',   year: 2025, month: 5, dow: 2, hour: 9 },
  { lat: -37.8140, lng: 144.9630, street: 'Bourke St',    zone: 'Z002', status: 'Unoccupied', year: 2025, month: 5, dow: 3, hour: 10 },
  { lat: -37.8162, lng: 144.9618, street: 'Elizabeth St', zone: 'Z003', status: 'Occupied',   year: 2024, month: 9, dow: 4, hour: 9 },
  { lat: -37.8172, lng: 144.9663, street: 'Queen St',     zone: 'Z004', status: 'Unoccupied', year: 2024, month: 9, dow: 1, hour: 11 },
  { lat: -37.8129, lng: 144.9642, street: 'Flinders St',  zone: 'Z005', status: 'Occupied',   year: 2025, month: 2, dow: 5, hour: 9 },
  { lat: -37.8137, lng: 144.9690, street: 'Swanston St',  zone: 'Z006', status: 'Unoccupied', year: 2025, month: 2, dow: 2, hour: 9 },
  { lat: -37.8108, lng: 144.9636, street: 'Spencer St',   zone: 'Z007', status: 'Occupied',   year: 2024, month: 11, dow: 3, hour: 8 },
  { lat: -37.8184, lng: 144.9648, street: 'Exhibition St',zone: 'Z008', status: 'Unoccupied', year: 2025, month: 5, dow: 1, hour: 9 },
  { lat: -37.8155, lng: 144.9603, street: 'King St',      zone: 'Z009', status: 'Occupied',   year: 2024, month: 9, dow: 2, hour: 9 },
  { lat: -37.8148, lng: 144.9671, street: 'Russell St',   zone: 'Z010', status: 'Unoccupied', year: 2025, month: 5, dow: 4, hour: 12 },
]

/* ---------- Map state ---------- */
const mapRef = ref(null)
const searchInput = ref(null)
let map, autocomplete
const mapsReady = ref(false)
const loadError = ref(false)
const resultsCount = ref(0)
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

// 搜索圆心 & 半径（米）
const searchCenter = ref(null)
const searchRadius = ref(1200) // 1.2km

/* ---------- Custom Icons ---------- */
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
  return { url, scaledSize: new google.maps.Size(s, s), anchor: new google.maps.Point(s/2, s/2) }
}
function initIcons() {
  ICON_OCCUPIED   = makeMarkerIcon('#EF4444', 'P')
  ICON_UNOCCUPIED = makeMarkerIcon('#10B981', 'U')
}
function clearMarkers() { markers.forEach(m => m.setMap(null)); markers = [] }
function addMarkers(rows) {
  clearMarkers()
  rows.forEach(spot => {
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

/* ---------- Filtering helpers ---------- */
function toRad(d){ return d*Math.PI/180 }
function distanceMeters(a, b){
  const R=6371000, dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng)
  const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2)
  const q= s1*s1 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*s2*s2
  return 2*R*Math.asin(Math.sqrt(q))
}

function matchesFilters(spot){
  // 年 / 月 / 星期几 / 小时
  if (form.years.length  && !form.years.includes(spot.year))  return false
  if (form.months.length && !form.months.includes(spot.month))return false
  if (form.days.length   && !form.days.includes(spot.dow))    return false
  if (typeof form.hour === 'number' && spot.hour !== form.hour) return false

  // 文本关键字（street / zone）
  if (form.keyword && form.keyword.trim().length>0){
    const kw = form.keyword.trim().toLowerCase()
    const ok = (spot.street||'').toLowerCase().includes(kw) || (spot.zone||'').toLowerCase().includes(kw)
    // 如果已选择地理圆心，则先用地理半径筛，再做文本匹配的“或”
    if (!searchCenter.value && !ok) return false
    if (searchCenter.value && !ok){
      // 有圆心时，文本不命中也允许（因为地理邻近）；如果想“同时满足”，把这一段删掉即可
    }
  }

  // 地理半径
  if (searchCenter.value){
    const d = distanceMeters({lat:spot.lat,lng:spot.lng}, searchCenter.value)
    if (d > searchRadius.value) return false
  }

  return true
}

/* ---------- Apply filters ---------- */
function applyFilters(){
  if (!map) return
  const filtered = parkingDataAll.filter(matchesFilters)
  resultsCount.value = filtered.length
  addMarkers(filtered)
  // 自动缩放到结果
  if (filtered.length){
    const bounds = new google.maps.LatLngBounds()
    filtered.forEach(p => bounds.extend({lat:p.lat,lng:p.lng}))
    if (searchCenter.value) bounds.extend(searchCenter.value)
    map.fitBounds(bounds, 60)
  }
}

/* ---------- Maps loader (stable) ---------- */
let gmapsPromise
function loadGoogleMaps(){
  if (window.google?.maps) return Promise.resolve()
  const KEY = GOOGLE_MAPS_KEY || (window.__GMAPS_KEY ?? '')
  if (!KEY) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_KEY'))

  if (!gmapsPromise){
    gmapsPromise = new Promise((resolve,reject)=>{
      const s=document.createElement('script')
      s.src=`https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&v=weekly`
      s.async=true; s.defer=true
      s.onerror=()=>reject(new Error('Failed to load Google Maps'))
      s.onload=()=>{
        const wait=()=>{ (window.google?.maps)? resolve() : setTimeout(wait,30) }
        wait()
      }
      document.head.appendChild(s)
    })
  }
  return gmapsPromise
}

/* ---------- Init map & autocomplete ---------- */
function initAutocomplete(){
  const input = searchInput.value
  if (!input || !window.google?.maps) return
  if (window.google.maps.places?.Autocomplete){
    const ac = new google.maps.places.Autocomplete(input, { fields:['geometry','name'] })
    ac.addListener('place_changed', ()=>{
      const p = ac.getPlace()
      const loc = p?.geometry?.location
      if (loc && map){
        searchCenter.value = { lat: loc.lat(), lng: loc.lng() }
        map.panTo(searchCenter.value); map.setZoom(15)
        applyFilters()
      }
    })
    autocomplete = ac
  }
}

function initMap(){
  if (!mapRef.value || !window.google?.maps) return
  map = new google.maps.Map(mapRef.value, {
    center:{lat:-37.8136,lng:144.9631}, zoom:15,
    mapTypeControl:false, streetViewControl:false, fullscreenControl:false
  })
  mapsReady.value = true
  initIcons()
  initAutocomplete()
  // 初次渲染
  resultsCount.value = parkingDataAll.length
  addMarkers(parkingDataAll)
}

/* ---------- Search button (geocode fallback) ---------- */
async function onSearch(){
  const q = form.keyword?.trim()
  if (!q || !map) return
  if (!window.google?.maps?.Geocoder) return
  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ address:q, componentRestrictions:{ country:'AU' } }, (res, status)=>{
    if (status==='OK' && res?.[0]?.geometry?.location){
      const loc = res[0].geometry.location
      searchCenter.value = { lat: loc.lat(), lng: loc.lng() }
      map.panTo(searchCenter.value); map.setZoom(15)
      applyFilters()
    } else {
      // 地理编码失败就仅用文本匹配
      searchCenter.value = null
      applyFilters()
    }
  })
}

/* ---------- Map utils ---------- */
const zoomIn  = () => map && map.setZoom(map.getZoom()+1)
const zoomOut = () => map && map.setZoom(map.getZoom()-1)

/* ---------- Lifecycle ---------- */
onMounted(async ()=>{
  try{
    await loadGoogleMaps()
    await nextTick()
    initMap()
  }catch(e){
    console.error('[Maps load failed]', e)
    loadError.value = true
  }
})
onBeforeUnmount(()=>{ clearMarkers(); map=null; autocomplete=null })
</script>
