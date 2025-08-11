<template>
  <div
    class="min-h-screen bg-cover bg-center relative"
    :style="{ backgroundImage: `url(${bgUser})` }"
  >
    <!-- shade -->
    <div class="absolute inset-0 bg-black opacity-40 z-0"></div>

    <!-- main content -->
    <div class="relative z-10 px-10 py-20 flex flex-col gap-10 text-black">
      <!-- Section Cards -->
      <div
        v-for="section in sections"
        :key="section.title"
        class="bg-white bg-opacity-90 p-6 rounded shadow"
      >
        <h2 class="text-2xl font-bold mb-2">{{ section.title }}</h2>
        <p class="text-lg">{{ section.content }}</p>
      </div>

      <!-- Our Team Section (5 people, same style as original) -->
      <div class="bg-white bg-opacity-90 p-6 rounded shadow">
        <h2 class="text-2xl font-bold mb-6">Our Team</h2>
        <div class="flex justify-around items-center flex-wrap gap-6">
          <div class="flex flex-col items-center">
            <img src="/images/Deekshita_Sridhar.png" alt="Deekshita Sridhar" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold text-center">Deekshita Sridhar</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/Jinyang_Zheng.png" alt="Jinyang Zheng" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold text-center">Jinyang Zheng</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/Neppalli_Sriteysha.png" alt="Neppalli Sriteysha" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold text-center">Neppalli Sriteysha</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/Tengyu_Zhang.png" alt="Tengyu Zhang" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold text-center">Tengyu Zhang</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/Zhenglin_Fang.png" alt="Zhenglin Fang" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold text-center">Zhenglin Fang</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const bgUser = new URL('../assets/user.png', import.meta.url).href

const sections = [
  {
    title: 'Our Mission',
    content: 'We aim to make Melbourne parking more efficient and eco-conscious through real-time data and smart insights.'
  },
  {
    title: 'Our Story',
    content: 'Born from a passion for sustainable urban mobility, our team has collaborated with the City of Melbourne to ease parking frustrations.'
  },
  {
    title: 'Our Approach',
    content: 'Combining user-centered design, open data, and modern technologies, we empower commuters with smarter parking decisions.'
  }
]
</script>
