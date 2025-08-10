<template>
  <section class="max-w-5xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Predictive Forecast</h1>

    <div class="flex justify-center">
      <forecastchart :history="history" :forecast="forecast" class="w-full max-w-3xl" />
    </div>

    <p class="mt-4 text-xs italic text-gray-400 max-w-3xl mx-auto">
      Forecast area is illustrative for demo. Replace with your model output when available.
    </p>
  </section>
</template>

<script setup>
import breadcrumbs from '../components/breadcrumbs.vue'
import forecastchart from '../components/forecastchart.vue'

// 面包屑
const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' },
  { text: 'Predictive Forecast' }
]

// 示例数据：2016Q1~2020Q4 为历史（20 点），2021Q1~Q4 为预测（4 点）
const base = 140000
const history = Array.from({ length: 20 }, (_, i) => Math.round(base + i * 1500))
const last = history[history.length - 1]
const forecast = Array.from({ length: 4 }, (_, i) => Math.round(last + (i + 1) * 1800))
</script>
