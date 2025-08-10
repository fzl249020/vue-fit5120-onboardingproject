<template>
  <section class="max-w-6xl mx-auto px-4 py-10">
    <breadcrumbs :items="crumbs" />
    <h1 class="text-2xl md:text-3xl font-bold mb-6">Historic Parking Availability</h1>

    <!-- search bar -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Search (Zone or Street)</label>
      <div class="relative">
        <input
          v-model="form.keyword"
          type="text"
          placeholder="e.g., Flinders St"
          class="w-full rounded-lg border px-4 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          @click="onSearch"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Filter Section (Year / Month / Day unified multi-select dropdown) -->
    <div class="bg-white rounded-xl border shadow-sm p-4 md:p-5 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Year -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Year</label>
          <MultiSelect
            v-model="form.years"
            :items="yearOptions"
            placeholder="Select years"
          />
        </div>

        <!-- Month -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Month</label>
          <MultiSelect
            v-model="form.months"
            :items="monthOptions"
            placeholder="Select months"
          />
        </div>

        <!-- Day of Week -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
          <MultiSelect
            v-model="form.days"
            :items="dayOptions"
            placeholder="Select days"
          />
        </div>

        <!-- Time -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Time</label>
          <div class="flex items-center gap-2">
            <select v-model.number="form.hour" class="w-20 rounded-lg border px-2 py-2">
              <option v-for="h in 24" :key="h-1" :value="h-1">{{ pad(h-1) }}</option>
            </select>
            <span>:</span>
            <select v-model.number="form.minute" class="w-20 rounded-lg border px-2 py-2">
              <option v-for="m in 60" :key="m-1" :value="m-1">{{ pad(m-1) }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <button class="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700" @click="applyFilters">
          Apply Filters
        </button>
        <button class="px-4 py-2 rounded-md border text-sm hover:bg-gray-50" @click="resetFilters">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Map placeholder -->
    <div class="relative rounded-xl border bg-white overflow-hidden">
      <div class="absolute left-3 top-3 z-10 flex flex-col shadow">
        <button class="w-9 h-9 bg-white border-b hover:bg-gray-50">+</button>
        <button class="w-9 h-9 bg-white hover:bg-gray-50">−</button>
      </div>
      <div class="h-[520px] flex items-center justify-center text-gray-400">
        <span class="text-sm">Map placeholder — integrate Leaflet / Mapbox / Google Maps later</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import breadcrumbs from '../components/breadcrumbs.vue'
import MultiSelect from '../components/MultiSelect.vue'

const crumbs = [
  { text: 'Home', href: '/' },
  { text: 'Features' },
  { text: 'Parking History' }
]

// options { value, label }）
const yearOptions  = [2022, 2023, 2024, 2025].map(y => ({ value: y, label: String(y) }))
const monthOptions = [
  { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' }, { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
]
const dayOptions   = [
  { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' }, { value: 0, label: 'Sun' }
]

// form state (multi-select uses arrays; month defaults to all selected)
const form = reactive({
  keyword: '',
  years: [2025, 2023],                     // default selected years
  months: monthOptions.map(m => m.value),  // default to all selected (All)
  days: [1,2,3,4,5],                       // default to weekdays
  hour: 9,
  minute: 0
})

const pad = (n) => String(n).padStart(2, '0')

const resetFilters = () => {
  form.keyword = ''
  form.years   = [2025]
  form.months  = monthOptions.map(m => m.value) // restore to "all selected"
  form.days    = [1,2,3,4,5]
  form.hour    = 9
  form.minute  = 0
}

const onSearch = () => {
  // TODO: integrate geocoding
}

const applyFilters = () => {
  // TODO: send form to backend or use for frontend filtering
  // console.log(JSON.parse(JSON.stringify(form)))
}
</script>
