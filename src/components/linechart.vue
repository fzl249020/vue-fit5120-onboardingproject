<template>
  <div ref="chartEl" class="w-full h-[380px] rounded-xl border bg-white shadow-sm"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  values: { type: Array, required: true }, // 24 个季度值
})

const chartEl = ref(null)
let chart

// 生成 X 轴季度标签：Q1 '16 ~ Q4 '21
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

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 50 },

    // X 轴（标题、刻度、浅灰虚线网格）
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: quarterLabels,
      name: 'Quarters',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { fontSize: 14, fontWeight: 500, color: '#6B7280' }, // Medium Grey
      axisLabel: { color: '#9CA3AF', fontSize: 12 }, // Light Grey
      splitLine: { show: true, lineStyle: { type: 'dashed', color: '#E5E7EB' } }
    },

    // Y 轴（标题与样式）
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

    series: [{
      name: 'Ownership',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,                 // 默认点尺寸
      areaStyle: { opacity: 0.15 },
      lineStyle: { width: 2, color: '#3B82F6' },
      emphasis: {
        scale: true,                 // 悬停点放大
        lineStyle: {
          shadowColor: 'rgba(59,130,246,0.5)',
          shadowBlur: 9,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#3B82F6',
          color: '#ffffff'
        }
      },
      data: props.values
    }]
  })
  chart.resize()
}

const handleResize = () => chart && chart.resize()

onMounted(() => {
  render()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chart && chart.dispose()
})

watch(() => props.values, render, { deep: true })
</script>
