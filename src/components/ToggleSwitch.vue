<template>
  <label class="inline-flex items-center gap-2 select-none cursor-pointer text-sm">
    <!-- 可访问性：原生 checkbox -->
    <input
      type="checkbox"
      class="sr-only peer"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      role="switch"
      :aria-checked="String(modelValue)"
      :aria-label="ariaLabel || label || 'Toggle'"
    />

    <!-- 轨道 + 圆点（伪元素） -->
    <span
      class="relative inline-flex w-11 h-6 rounded-full
             bg-gray-300 peer-checked:bg-blue-600
             transition-colors duration-200 ease-in-out
             after:content-[''] after:absolute after:top-0.5 after:left-0.5
             after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow
             after:transform after:transition-transform after:duration-200 after:ease-in-out
             peer-checked:after:translate-x-5"
      aria-hidden="true"
    ></span>

    <span v-if="label">{{ label }}</span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  ariaLabel: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>
