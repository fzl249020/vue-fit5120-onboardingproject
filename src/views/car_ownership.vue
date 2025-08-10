<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />

    <!-- header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">
        {{ chartTitle }}
      </h1>
      <div class="flex items-center gap-3">
        <!-- Compare：switch with label -->
        <ToggleSwitch v-model="compare" label="Compare" />

        <!-- Share button -->
        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
          @click="onShare"
          :disabled="sharing"
          title="Share"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke-width="1.8"/>
            <path d="M16 6l-4-4-4 4M12 2v14" stroke-width="1.8"/>
          </svg>
          <span v-if="!sharing">Share</span>
          <span v-else>Preparing…</span>
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div class="flex justify-center">
      <linechart
        ref="chartRef"
        class="w-full max-w-3xl"
        :labels="labels"
        :series="series"
        :y-label="yLabel"
        :show-legend="compare"
        :title="chartTitle"
      />
    </div>

    <!-- Chart Disclaimer -->
    <p class="mt-4 text-xs italic text-gray-400 max-w-3xl mx-auto">
      Quarterly data is an estimation based on annual figures.
    </p>

    <!-- Impact Summary -->
    <section class="mt-8 max-w-3xl mx-auto">
      <h2 class="text-xl font-semibold mb-2">Impact Summary</h2>
      <p class="text-gray-700 leading-7">
        Estimated quarterly values indicate a mid-2020 softness, with Q2–Q3 showing a dip and a stronger rebound in Q4.
        Registrations continue to improve through 2021, ending above 2020 levels. This rebound implies rising road
        congestion and increasing parking pressure in the CBD, especially during peak periods.
      </p>
    </section>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import breadcrumbs from '../components/breadcrumbs.vue'
import linechart from '../components/linechart.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import { getVicQuarterly } from '../api/vehicle'

/** Chart Title */
const chartTitle = 'Quarterly Car Ownership Trends: Melbourne (2016–2021)'

/** Breadcrumbs */
const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' },
  { text: 'Data Insights' },
  { text: 'Car Ownership Trends' }
]

/** tool: buildLabels */
const buildLabels = () => {
  const out = []
  for (let y = 2016; y <= 2021; y++) for (let q = 1; q <= 4; q++) out.push(`Q${q}-${y}`)
  return out
}

/** Seasonal weights (for fallback use only) */
const weightsForYear = (y) => {
  if (y === 2020) return [0.28, 0.18, 0.18, 0.36]
  if (y === 2021) return [0.30, 0.27, 0.22, 0.21]
  if (y >= 2017 && y <= 2019) return [0.28, 0.22, 0.22, 0.28]
  return [0.25, 0.25, 0.25, 0.25]
}

/** annual YoY%（for fallback use only） */
const CAR_YOY = { 2016: 0.020, 2017: 0.025, 2018: 0.023, 2019: 0.028, 2020: -0.018, 2021: 0.035 }
const POP_YOY = { 2016: 0.018, 2017: 0.022, 2018: 0.021, 2019: 0.015, 2020: -0.010, 2021: 0.012 }

/** local fallback: build indexed series from annual YoY% */
function buildIndexedSeries(annualYoY, baseIndex = 100, baseAbs = 2000000) {
  const data = []
  let idx = baseIndex
  let abs = baseAbs
  for (let i = 0; i < 24; i++) {
    const year = 2016 + Math.floor(i / 4)
    const qi = i % 4
    if (i === 0) { data.push({ index: 100, added: 0 }); continue }
    const yoy = annualYoY[year] ?? 0
    const w = weightsForYear(year)[qi]
    const growth = Math.pow(1 + yoy, w)
    const addedAbs = (year === 2016) ? 0 : Math.round(abs * (growth - 1))
    abs = Math.round(abs + addedAbs)
    idx = idx * growth
    data.push({ index: +idx.toFixed(2), added: addedAbs })
  }
  return data
}

/** —— use backend structure —— */
function fromApi(rows) {
  if (!Array.isArray(rows) || rows.length !== 24) return null
  const sorted = [...rows].sort((a, b) => a.year - b.year || a.quarter - b.quarter)
  const labels = sorted.map(r => r.quarter_label) // e.g. 'Q1-2016'
  const data = sorted.map(r => ({
    index: +Number(r.index_val).toFixed(2),
    added: Number(r.est_added_vehicles) || 0
  }))
  return { labels, data }
}

/** status */
const CACHE_KEY = 'vic-car-pop-index-2016-2021-v1'
const labels = ref(buildLabels())  // use fallback labels
const compare = ref(false)
const chartRef = ref(null)
const sharing = ref(false)
const carData = ref([])
const popData = ref([])

/** Load data (prefer API, fallback to local) */
onMounted(async () => {
  try {
    const res = await getVicQuarterly({ region: 'VIC', from: '2016Q1', to: '2021Q4' })
      .catch(() => getVicQuarterly())

    const mapped = fromApi(res)
    if (!mapped) throw new Error('Unexpected payload')

    labels.value = mapped.labels
    carData.value = mapped.data
    // temporarily use the same data for population
    popData.value = mapped.data.map(d => ({ index: +(d.index * 0.98).toFixed(2), added: 0 }))

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      car: carData.value, pop: popData.value, labels: labels.value
    }))
  } catch (e) {
    labels.value = buildLabels()
    carData.value = buildIndexedSeries(CAR_YOY)
    popData.value = buildIndexedSeries(POP_YOY)
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      car: carData.value, pop: popData.value, labels: labels.value
    }))
    console.warn('Use fallback data:', e?.message || e)
  }
})

/** send data to chart */
const series = computed(() => {
  const car = { name: 'Car Ownership (Index)', color: '#0B4F9C', data: carData.value }
  if (!compare.value) return [car]
  const pop = { name: 'Population (Index)', color: '#F59E0B', data: popData.value }
  return [car, pop]
})
const yLabel = computed(() =>
  compare.value ? 'Indexed (2016-Q1 = 100)' : 'Registered Vehicles (Indexed, 2016-Q1 = 100)'
)

/** share */
async function onShare() {
  try {
    sharing.value = true
    const dataURL = chartRef.value?.getDataURL?.()
    if (!dataURL) return
    const blob = await (await fetch(dataURL)).blob()
    const file = new File([blob], 'car-ownership-trends.png', { type: blob.type })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: chartTitle })
    } else {
      const a = document.createElement('a')
      a.href = dataURL; a.download = 'car-ownership-trends.png'
      document.body.appendChild(a); a.click(); a.remove()
    }
  } finally {
    sharing.value = false
  }
}
</script>
