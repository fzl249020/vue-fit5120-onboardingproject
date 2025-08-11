<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <!-- <breadcrumbs :items="crumbs" /> -->
    <h1 class="text-2xl md:text-3xl font-bold mb-6">CBD Population Trends</h1>

    <div class="flex justify-center">
      <div ref="chartEl" class="w-full max-w-3xl h-[420px] rounded-xl border bg-white shadow-sm"></div>
    </div>

    <article class="mt-8 prose prose-gray max-w-3xl mx-auto">
      <p>
        The heatmap visualizes relative population intensity across time.
        Darker cells indicate higher presence. Swap the sample with your dataset.
      </p>
    </article>
  </section>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref } from 'vue'
// import breadcrumbs from '../components/breadcrumbs.vue'

// const crumbs = [
//   { text: 'Home', href: '/' },
//   { text: 'Features' },
//   { text: 'Data Insights' },
//   { text: 'CBD Population Trends' }
// ]


const chartEl = ref(null)
let chart

const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const sample = []
for (let d = 0; d < days.length; d++) {
  for (let h = 0; h < hours.length; h++) {
    const base = (d < 5 ? (h >= 8 && h <= 18 ? 70 : 25) : (h >= 11 && h <= 22 ? 65 : 20))
    const noise = Math.round((Math.random() - 0.5) * 10)
    sample.push([h, d, Math.max(0, base + noise)])
  }
}

const initChart = () => {
  chart = echarts.init(chartEl.value)
  chart.setOption({
    tooltip: { position: 'top' },
    grid: { left: 80, right: 30, top: 30, bottom: 50 },
    xAxis: { type: 'category', data: hours, splitArea: { show: true }, axisLabel: { interval: 2, color: '#9CA3AF' } },
    yAxis: { type: 'category', data: days, splitArea: { show: true }, axisLabel: { color: '#9CA3AF' } },
    visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 10 },
    series: [{
      name: 'Population intensity',
      type: 'heatmap',
      data: sample,
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' } },
      progressive: 1000
    }]
  })
}

const resize = () => chart && chart.resize()
onMounted(() => { initChart(); window.addEventListener('resize', resize) })
onBeforeUnmount(() => { window.removeEventListener('resize', resize); chart && chart.dispose() })
</script>
