<template>
  <div
    class="min-h-screen bg-cover bg-center relative"
    :style="{ backgroundImage: `url(${bgFeature})` }"
  >
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black opacity-60 z-0"></div>

    <!-- 主内容 -->
    <div class="relative z-10 px-10 py-20 flex flex-col text-white min-h-screen">
      <div class="flex justify-between items-start gap-10">
        <!-- 图表选择 + 图表区域 -->
        <div class="w-2/3 flex flex-col gap-6">
          <!-- 下拉选择器 -->
          <label class="font-semibold text-lg">Melbourne Parking Statistics</label>
          <select
            v-model="selectedGraph"
            class="w-1/2 p-2 rounded text-black font-medium"
          >
            <option value="line">Car Ownership Trends</option>
            <option value="bar">CBD Population Trends</option>
            <option value="pie">extend graph</option>
          </select>

          <!-- 图表容器 -->
        <div
        id="chart"
        class="bg-white rounded shadow-lg w-full h-[400px] p-4 flex items-center justify-center"
        >
        <p class="text-gray-400">[Chart will be rendered here]</p>
        </div>

        </div>

        <!-- Explanation 区域 -->
        <div class="w-1/3 bg-white bg-opacity-90 p-6 rounded shadow text-black mt-[113px]">
          <h2 class="text-xl font-bold mb-4">Explanation</h2>
          <p class="leading-relaxed">{{ explanationText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, watch, onMounted } from 'vue'

const bgFeature = new URL('../assets/feature.png', import.meta.url).href
const selectedGraph = ref('line')
const explanationText = ref('')

// 根据选择更新文字和图表
watch(selectedGraph, (newVal) => {
  updateExplanation(newVal)
  drawGraph(newVal)
})

onMounted(() => {
  updateExplanation(selectedGraph.value)
  drawGraph(selectedGraph.value)
})

function updateExplanation(type) {
  switch (type) {
    case 'line':
      explanationText.value =
        'This is a line chart showing trends over time. It is useful for analyzing patterns and changes across continuous data.'
      break
    case 'bar':
      explanationText.value =
        'This is a bar chart comparing discrete categories. Great for showing quantities in different groups.s'
      break
    case 'pie':
      explanationText.value =
        'This is a pie chart representing proportions of a whole. Ideal for displaying part-to-whole relationships.'
      break
    default:
      explanationText.value = ''
  }
}

function drawGraph(type) {
  const chartDom = document.getElementById('chart')
  if (!chartDom) return

  const myChart = echarts.init(chartDom)
  let option = {}

if (type === 'line') {
  const quarters = [
    'Q1 2021', 'Q2 2021', 'Q3 2021', 'Q4 2021',
    'Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022',
    'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023',
    'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'
  ]

  // 模拟从年度数据插值得出的季度注册车辆数量（单位：辆）
  const vehicleData = [
    420000, 430000, 440000, 450000, // 2021 (线性增长)
    460000, 470000, 475000, 480000, // 2022
    490000, 500000, 510000, 515000, // 2023
    520000, 525000, 530000, 540000  // 2024
  ]

  option = {
    title: {
      text: 'Quarterly Car Ownership Trends: Melbourne (2021–2024)',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: quarters,
      axisLabel: {
        color: '#ffffff',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Registered Vehicles',
      nameTextStyle: { color: '#ffffff' },
      axisLabel: {
        color: '#ffffff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.2)'
        }
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '18%',
      top: '14%',
      containLabel: true
    },
    series: [
      {
        name: 'Registered Vehicles',
        type: 'line',
        data: vehicleData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#003366',
          width: 3
        },
        itemStyle: {
          color: '#003366'
        },
        areaStyle: {
          color: 'rgba(0, 51, 102, 0.2)'
        }
      }
    ]
  }
  } else if (type === 'bar') {
    option = {
      title: { text: 'Bar Chart' },
      tooltip: {},
      xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
      yAxis: { type: 'value' },
      series: [
        {
          data: [10, 52, 200, 334],
          type: 'bar',
        },
      ],
    }
  } else if (type === 'pie') {
    option = {
      title: { text: 'Pie Chart', left: 'center' },
      tooltip: { trigger: 'item' },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 1048, name: 'Search Engine' },
            { value: 735, name: 'Direct' },
            { value: 580, name: 'Email' },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
  }

  myChart.setOption(option)
}
</script>
