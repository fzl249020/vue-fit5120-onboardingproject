<template>
  <div ref="chartEl" class="w-full h-[380px] rounded-xl border bg-white shadow-sm"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const props = defineProps({
  labels: { type: Array, required: true },          // ['Q1-2016', ... 'Q4-2021']
  series: { type: Array, required: true },          // [{ name, color, dashed?, data:[{index, added}] }]
  yLabel: { type: String, required: true },         // e.g. 'Registered Vehicles (Indexed, 2016-Q1 = 100)'
  showLegend: { type: Boolean, default: false },
  title: { type: String, default: '' }              // also used for exporting
})

const chartEl = ref(null)
let chart

const hexToShadow = (hex, alpha = 0.5) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return 'rgba(0,0,0,0.35)'
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const buildOption = () => ({
  //  title will display if provided
  title: props.title
    ? {
        text: props.title,
        left: 'center',
        top: 6,
        textStyle: { fontSize: 14, fontWeight: 600, color: '#111827' }
      }
    : undefined,

  tooltip: {
    trigger: 'axis',
    backgroundColor: '#374151', // dark grey
    borderColor: '#374151',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'line' },
    formatter: (params) => {
      const quarter = params[0]?.axisValue || ''
      const primary = params.find(p => p.seriesIndex === 0) || params[0]
      const idx = primary?.data?.index ?? primary?.data ?? 0
      const added = primary?.data?.added ?? 0
      let html = `Quarter: ${quarter}<br/>Index: ${(+idx).toFixed(2)}<br/>Est. added: ${(added || 0).toLocaleString()}`
      if (params.length > 1) {
        for (let i = 1; i < params.length; i++) {
          const it = params[i]
          const v = it?.data?.index ?? it?.data ?? 0
          html += `<br/>${it.seriesName}: ${(+v).toFixed(2)}`
        }
      }
      return html
    }
  },

  // when showLegend is true, display legend at the bottom
  grid: { left: 80, right: 24, top: props.title ? 64 : 40, bottom: props.showLegend ? 80 : 56 },

  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.labels,
    name: 'Quarters',
    nameLocation: 'middle',
    nameGap: 30,
    nameTextStyle: { fontSize: 14, fontWeight: 500, color: '#6B7280' },
    axisLabel: { color: '#9CA3AF', fontSize: 12 },
    splitLine: { show: true, lineStyle: { type: 'dashed', color: '#E5E7EB' } }
  },

  yAxis: {
    type: 'value',
    name: props.yLabel,
    nameLocation  : 'middle',
    nameGap       : 50,
    nameRotate   : 90,
    nameTextStyle: { fontSize: 14, fontWeight: 500, color: '#6B7280' },
    axisLabel: { color: '#9CA3AF', fontSize: 12 },
    splitLine: { show: true, lineStyle: { type: 'solid', color: '#E5E7EB' } }
  },

  legend: props.showLegend ? { bottom: 10 } : undefined,

  series: props.series.map((s, i) => ({
    name: s.name,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2, color: s.color, type: s.dashed ? 'dashed' : 'solid' },
    areaStyle: { opacity: i === 0 ? 0.10 : 0.06 },
    emphasis: {
      scale: true,
      lineStyle: {
        shadowColor: hexToShadow(s.color, 0.5),
        shadowBlur: 9,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      itemStyle: {
        borderWidth: 2, borderColor: s.color, color: '#ffffff'
      }
    },
    data: s.data.map(d => ({ value: d.index, index: d.index, added: d.added }))
  }))
})

const render = () => {
  if (!chart) chart = echarts.init(chartEl.value)
  chart.setOption(buildOption(), true)
  chart.resize()
}

const handleResize = () => chart && chart.resize()
onMounted(() => { render(); window.addEventListener('resize', handleResize) })
onBeforeUnmount(() => { window.removeEventListener('resize', handleResize); chart && chart.dispose() })

watch(() => [props.labels, props.series, props.yLabel, props.showLegend, props.title], () => nextTick(render), { deep: true })

// Export for sharing
const getDataURL = (opts = {}) => chart?.getDataURL({ pixelRatio: 2, backgroundColor: '#ffffff', ...opts })
defineExpose({ getDataURL })
</script>
