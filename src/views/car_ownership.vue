<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Car Ownership Trends</h1>

    <div class="flex justify-center">
      <linechart :values="quarterly" class="w-full max-w-3xl" />
    </div>

    <!-- 免责声明（12px / 斜体 / 浅灰 / 与主内容相隔 16px） -->
    <p class="mt-4 text-xs italic text-gray-400 max-w-3xl mx-auto">
      Quarterly data is an estimation based on annual figures.
    </p>

    <article class="mt-8 prose prose-gray max-w-3xl mx-auto">
      <p>This line graph shows changes in car ownership. Replace the sample data with your real dataset.</p>
    </article>
  </section>
</template>

<script setup>
import breadcrumbs from '../components/breadcrumbs.vue'
import linechart from '../components/linechart.vue'

// 面包屑
const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' }, // 你没有 /features 页面，就不加 href
  { text: 'Car Ownership Trends' }
]

// —— 示例：用“年度值”做线性插值生成季度数据（24 个点 Q1'16~Q4'21）——
const annual = { 2016: 140000, 2017: 145000, 2018: 150000, 2019: 158000, 2020: 165000, 2021: 172000 }

const quarterly = (() => {
  const arr = []
  const years = [2016, 2017, 2018, 2019, 2020, 2021]
  for (let i = 0; i < years.length; i++) {
    const y = years[i]
    const next = i < years.length - 1 ? years[i + 1] : y
    const start = annual[y]
    const end = annual[next]
    const step = (end - start) / 4
    for (let q = 0; q < 4; q++) arr.push(Math.round(start + step * q))
  }
  return arr
})()
</script>
