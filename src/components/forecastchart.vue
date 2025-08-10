<template>
  <div ref="chartEl" class="w-full h-[420px] rounded-xl border bg-white shadow-sm"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  // history and forecast data
  history:  { type: Array, required: true },
  forecast: { type: Array, required: true },
})

const chartEl = ref(null)
let chart

// Generate Q1 '16 ~ Q4 '21
const quarterLabels = (() => {
  const labels = []
  for (let y = 2016; y <= 2021; y++) {
    for (let q = 1; q <= 4; q++) {
      const yy = String(y).slice(2)
      labels.push(`Q${q} '${yy}`)
    }
  }
  return labels
})()

const render = () => {
  if (!chart) chart = echarts.init(chartEl.value)

  const historyLen = props.history.length
  const totalLen   = quarterLabels.length // 24
  // generate series：use null placeholder，ensure correct x-axis alignment
  const seriesHistorical = [...props.history, ...Array(totalLen - historyLen).fill(null)]
  const seriesForecast   = [...Array(historyLen).fill(null), ...props.forecast]

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 50 },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: quarterLabels,
      name: 'Quarters',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 14, fontWeight: 500, color: '#6B7280' },
      axisLabel: { color: '#9CA3AF', fontSize: 12 },
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#E5E7EB' } }
    },

    yAxis: {
      type: 'value',
      name: 'Estimated Number of Registered Vehicles',
      nameTextStyle: { fontSize: 14, fontWeight: 500, color: '#6B7280' },
      axisLabel: {
        formatter: (v) => `${Math.round(v / 1000)}k`,
        fontSize: 12, color: '#9CA3AF'
      },
      splitLine: { show: true, lineStyle: { type: 'solid', color: '#E5E7EB' } }
    },

    legend: { top: 0 },

    series: [
      {
        name: 'Historical',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: { opacity: 0.08 },
        lineStyle: { width: 2, color: '#2563EB' },
        emphasis: {
          scale: true,
          lineStyle: {
            shadowColor: 'rgba(37,99,235,0.5)',
            shadowBlur: 9,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          },
          itemStyle: {
            borderWidth: 2, borderColor: '#2563EB', color: '#ffffff'
          }
        },
        data: seriesHistorical
      },
      {
        name: 'Forecast',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, type: 'dashed', color: '#64748B' },
        emphasis: {
          scale: true,
          lineStyle: {
            shadowColor: 'rgba(100,116,139,0.45)',
            shadowBlur: 9,
            shadowOffsetX: 0,
            shadowOffsetY: 0
          },
          itemStyle: {
            borderWidth: 2, borderColor: '#64748B', color: '#ffffff'
          }
        },
        areaStyle: { opacity: 0.05 },
        data: seriesForecast,
        connectNulls: true,
        markArea: {
          itemStyle: { color: 'rgba(99,102,241,0.06)' },
          data: [[{ xAxis: "Q1 '21" }, { xAxis: "Q4 '21" }]]
        }
      }
    ]
  })

  chart.resize()
}

const onResize = () => chart && chart.resize()

onMounted(() => {
  render()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart && chart.dispose()
})
watch(() => [props.history, props.forecast], render, { deep: true })
</script>
