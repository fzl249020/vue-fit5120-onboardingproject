<template>
  <div
    class="min-h-screen bg-cover bg-center relative"
    style="background-image: url('/images/user.png');"
  >
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black opacity-40 z-0"></div>

    <!-- 主体内容 -->
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

      <!-- Our Team Section -->
      <div class="bg-white bg-opacity-90 p-6 rounded shadow">
        <h2 class="text-2xl font-bold mb-6">Our Team</h2>
        <div class="flex justify-around items-center">
          <div class="flex flex-col items-center">
            <img src="/images/peter.png" alt="Peter" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold">Peter</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/mary.png" alt="Mary" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold">Mary</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/images/bob.png" alt="Bob" class="w-28 h-28 rounded-full object-cover" />
            <span class="mt-2 font-semibold">Bob</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
];
</script>
