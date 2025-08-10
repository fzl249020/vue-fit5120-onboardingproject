<template>
  <nav class="text-sm text-gray-500 mb-4">
    <ul class="flex items-center gap-2 flex-wrap">
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
        <router-link v-if="item.href" :to="item.href" class="hover:text-gray-700">
          {{ item.text }}
        </router-link>
        <span v-else class="text-gray-700">{{ item.text }}</span>
        <span v-if="i < items.length - 1">›</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] }
})
</script>
