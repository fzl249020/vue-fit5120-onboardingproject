<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />

    <!-- header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl md:text-3xl font-bold">
        {{ chartTitle }}
      </h1>
      <div class="flex items-center gap-3">
        <!-- Compare：切换开关（组件版，带动画） -->
        <ToggleSwitch v-model="compare" label="Compare" />

        <!-- Share button -->
        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
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

/** 标题（同时用于导出图片中的图内标题） */
const chartTitle = 'Quarterly Car Ownership Trends: Melbourne (2016–2021)'

/** Breadcrumbs */
const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' },
  { text: 'Data Insights' },
  { text: 'Car Ownership Trends' }
]


/** 工具：季度标签 Q1-2016 … Q4-2021 */
const buildLabels = () => {
  const out = []
  for (let y = 2016; y <= 2021; y++) for (let q = 1; q <= 4; q++) out.push(`Q${q}-${y}`)
  return out
}

/** 季节权重（按 AC 规则） */
const weightsForYear = (y) => {
  if (y === 2020) return [0.28, 0.18, 0.18, 0.36] // COVID 中间弱，Q4 反弹
  if (y === 2021) return [0.30, 0.27, 0.22, 0.21] // H1 强，H2 正常化
  if (y >= 2017 && y <= 2019) return [0.28, 0.22, 0.22, 0.28] // 温和季节性
  return [0.25, 0.25, 0.25, 0.25] // 2016
}

/** 年度 YoY%（占位） */
const CAR_YOY = { 2016: 0.020, 2017: 0.025, 2018: 0.023, 2019: 0.028, 2020: -0.018, 2021: 0.035 }
const POP_YOY = { 2016: 0.018, 2017: 0.022, 2018: 0.021, 2019: 0.015, 2020: -0.010, 2021: 0.012 }

/** 指数与“估算新增”生成（2016Q1=100；2016 各季度 added=0） */
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


function toIndexedData(rows) {
  const parseQ = (q) => {
    const s = String(q)
    let m = s.match(/(\d{4}).*?Q([1-4])/i)
    if (!m) m = s.match(/Q([1-4]).*?(\d{4})/i)
    if (!m) return { y: 0, q: 0 }
    const y = +(m[1].length === 4 ? m[1] : m[2])
    const qi = +(m[2] || m[1])
    return { y, q: qi }
  }

  const arr = Array.isArray(rows) ? rows : (rows?.quarterly || rows?.rows || [])
  const norm = arr
    .map(r => {
      const quarter = r.quarter || r.q || r.period || ''
      const { y, q } = parseQ(quarter)
      return { ...r, __y: y, __q: q }
    })
    .filter(r => r.__y >= 2016 && r.__y <= 2021 && r.__q >= 1 && r.__q <= 4)
    .sort((a, b) => a.__y - b.__y || a.__q - b.__q)
    .slice(0, 24)

  if (!norm.length) return null

  if ('index' in norm[0]) {
    // 后端直接给指数
    return norm.map(r => ({
      index: +Number(r.index).toFixed(2),
      added: r.__y === 2016 ? 0 : (Number(r.added) || 0)
    }))
  }

  if ('value' in norm[0]) {
    // 绝对值 => 指数（以首个点为 100）
    const first = Number(norm[0].value) || 1
    return norm.map(r => {
      const idx = +((Number(r.value) / first) * 100).toFixed(2)
      const added = r.__y === 2016 ? 0 : Math.max(0, Math.round((Number(r.value) || 0) - first))
      return { index: idx, added }
    })
  }

  return null
}

/** 缓存 */
const CACHE_KEY = 'vic-car-pop-index-2016-2021-v1'

const labels = ref(buildLabels())
const compare = ref(false)
const chartRef = ref(null)
const sharing = ref(false)

const carData = ref([])
const popData = ref([])

onMounted(async () => {
  try {
    // 优先带参数请求；不支持参数就退回无参
    const res = await getVicQuarterly({ region: 'VIC', from: '2016Q1', to: '2021Q4' })
      .catch(() => getVicQuarterly())

    const data = toIndexedData(res)
    if (!data || data.length !== 24) throw new Error('Unexpected payload')

    carData.value = data
    // 临时人口对比：用车指数的 0.98x 占位（有真实人口接口后替换）
    popData.value = data.map(d => ({ index: +(d.index * 0.98).toFixed(2), added: 0 }))

    localStorage.setItem(CACHE_KEY, JSON.stringify({ car: carData.value, pop: popData.value }))
  } catch (e) {
    // 回退：用你现有的本地 YoY 计算
    carData.value = buildIndexedSeries(CAR_YOY)
    popData.value = buildIndexedSeries(POP_YOY)
    localStorage.setItem(CACHE_KEY, JSON.stringify({ car: carData.value, pop: popData.value }))
    console.warn('Use fallback data:', e?.message || e)
  }
})


/** 传给图表的序列与 Y 轴标签 */
const series = computed(() => {
  const car = { name: 'Car Ownership (Index)', color: '#0B4F9C', data: carData.value }
  if (!compare.value) return [car]
  const pop = { name: 'Population (Index)', color: '#F59E0B', data: popData.value }
  return [car, pop]
})

const yLabel = computed(() =>
  compare.value ? 'Indexed (2016-Q1 = 100)' : 'Registered Vehicles (Indexed, 2016-Q1 = 100)'
)

/** 分享导出（导出 PNG 会包含图内标题与当前图例状态） */
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
