<script setup>
const bgCity = new URL('../assets/city.png', import.meta.url).href
</script>

<template>
  <div class="relative min-h-screen bg-cover bg-center" :style="{ backgroundImage: `url(${bgCity})` }">
    <!-- shade -->
    <div class="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

    <!-- content area -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen text-white text-center px-4">
      <h1 class="text-4xl font-extrabold drop-shadow-lg mb-6">Find a Parking Spot in Melbourne</h1>
      <div class="flex gap-2 mb-8">
        <input type="text" placeholder="Enter your destination..." class="px-4 py-2 rounded border border-gray-300 text-black w-64" />
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Find Parking</button>
      </div>
      <!-- put grid below the search bar -->
      <section class="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        <!-- card 1 -->
        <div class="rounded-xl border shadow-sm p-6 bg-white/90 backdrop-blur">
          <div class="text-2xl mb-2 font-extrabold text-black font-serif"> Step 1</div>
          <h3 class="text-lg font-semibold mb-2 text-black">Enter your destination</h3>
          <p class="text-gray-600 leading-7">
            Type a street, venue, or suburb. We’ll center the map around that area so
            you can quickly see nearby on‑street and off‑street options.
          </p>
          <ul class="mt-3 text-gray-600 list-disc list-inside space-y-1">
            <li>Supports landmarks and partial addresses</li>
            <li>Recent searches auto‑suggest (coming soon)</li>
          </ul>
        </div>

        <!-- card 2 -->
        <div class="rounded-xl border shadow-sm p-6 bg-white/90 backdrop-blur">
          <div class="text-2xl mb-2 font-extrabold text-black font-serif"> Step 2</div>
          <h3 class="text-lg font-semibold mb-2 text-black">Click “Find Parking”</h3>
          <p class="text-gray-600 leading-7">
            Instantly view pins on the map with pricing, time limits, and walking
            distance. Filter by max stay or price to narrow down quickly.
          </p>
          <ul class="mt-3 text-gray-600 list-disc list-inside space-y-1">
            <li>See peak vs. off‑peak availability</li>
            <li>Traffic overlays help avoid congestion</li>
          </ul>
        </div>

        <!-- card 3 -->
        <div class="rounded-xl border shadow-sm p-6 bg-white/90 backdrop-blur">
          <div class="text-2xl mb-2 font-extrabold text-black font-serif"> Step 3</div>
          <h3 class="text-lg font-semibold mb-2 text-black">Explore insights</h3>
          <p class="text-gray-600 leading-7">
            Check historical trends to choose smarter times and streets. Save your
            favorite spots and get heads‑up alerts for street events.
          </p>
          <ul class="mt-3 text-gray-600 list-disc list-inside space-y-1">
            <li>Heatmaps of busy zones</li>
            <li>Event‑day notifications (beta)</li>
          </ul>
        </div>
      </section>

    </div>
  </div>
</template>
