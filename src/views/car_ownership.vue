<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Car Ownership Trends</h1>

    <!-- 图表：居中 -->
    <div class="flex justify-center">
      <div ref="chartEl" class="w-full max-w-3xl h-[380px] rounded-xl border bg-white shadow-sm"></div>
    </div>

    <!-- 解释：图表下方 -->
    <article class="mt-8 prose prose-gray max-w-3xl mx-auto">
      <p>
        This line graph shows changes in car ownership across recent periods.
        Replace the sample data with your real dataset.
      </p>
    </article>
  </section>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const chartEl = ref(null)
let chart

const initChart = () => {
  chart = echarts.init(chartEl.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
    },
    yAxis: { type: 'value', name: 'Cars / 1k residents' },
    series: [{
      name: 'Ownership',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      areaStyle: { opacity: 0.15 },
      data: [540, 555, 570, 565, 575, 590, 600] // TODO: 替换为真实数据
    }]
  })
}

const resize = () => chart && chart.resize()

onMounted(() => {
  initChart()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart && chart.dispose()
})
</script>
