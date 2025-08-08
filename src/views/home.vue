<template>
  <div class="relative min-h-screen bg-cover bg-center" style="background-image: url('/images/city.png');">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

    <!-- 内容区域 -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen text-white text-center px-4">
      <h1 class="text-4xl font-extrabold drop-shadow-lg mb-6">Find a Parking Spot in Melbourne</h1>
      <div class="flex gap-2 mb-8">
        <input type="text" placeholder="Enter your destination..." class="px-4 py-2 rounded border border-gray-300 text-black w-64" />
        <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Find Parking</button>
      </div>
      <div class="bg-white bg-opacity-90 text-black rounded-lg shadow-lg p-6 max-w-md">
        <h2 class="text-xl font-semibold mb-4">How to Use This Website</h2>
        <ul class="list-disc text-left list-inside space-y-1">
          <li>Enter your destination above</li>
          <li>Click "Find Parking"</li>
          <li>View real-time parking options on the map</li>
          <li>Check trends and traffic insights</li>
          <li>Park smart and stay informed</li>
        </ul>
      </div>
    </div>
  </div>
</template>
