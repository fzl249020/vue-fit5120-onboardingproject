<template>
  <div class="relative inline-block w-full" ref="root">
    <!-- Trigger -->
    <button
      type="button"
      class="w-full rounded-lg border px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
      @click="open = !open"
    >
      <span class="truncate">
        <template v-if="modelValue.length === 0">{{ placeholder }}</template>
        <template v-else-if="modelValue.length === items.length">All selected</template>
        <template v-else>{{ selectedLabels.join(', ') }}</template>
      </span>
      <svg class="w-4 h-4 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.062l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" clip-rule="evenodd"/></svg>
    </button>

    <!-- Dropdown Panel -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg p-2"
    >
      <div class="flex items-center justify-between px-2 py-1 text-xs text-gray-500">
        <button class="hover:text-gray-700" @click="selectAll">Select all</button>
        <button class="hover:text-gray-700" @click="clearAll">Clear</button>
      </div>
      <ul class="max-h-56 overflow-auto text-sm">
        <li v-for="it in items" :key="it.value" class="px-2 py-1 hover:bg-gray-50 rounded">
          <label class="inline-flex items-center gap-2 w-full cursor-pointer">
            <input type="checkbox" :value="it.value" :checked="isChecked(it.value)" @change="toggle(it.value)" />
            <span class="truncate">{{ it.label }}</span>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },      // [{ value, label }]
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select...' }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const selectedLabels = computed(() =>
  props.items.filter(i => props.modelValue.includes(i.value)).map(i => i.label)
)

const isChecked = (v) => props.modelValue.includes(v)
const toggle = (v) => {
  const cur = new Set(props.modelValue)
  cur.has(v) ? cur.delete(v) : cur.add(v)
  emit('update:modelValue', Array.from(cur))
}
const selectAll = () => emit('update:modelValue', props.items.map(i => i.value))
const clearAll = () => emit('update:modelValue', [])

const onClickOutside = (e) => {
  if (!root.value) return
  if (!root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
