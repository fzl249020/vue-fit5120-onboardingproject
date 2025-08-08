<template>
  <div>
    <nav class="bg-white text-black shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <img src="/images/logo.png" alt="Logo" class="h-10 w-10" />
          <span class="text-xl font-semibold">Melbourne Parking</span>
        </div>
        <div class="flex space-x-6 font-medium">
          <router-link to="/" class="hover:text-blue-600">Home</router-link>
          <router-link to="/about" class="hover:text-blue-600">About Us</router-link>
          <router-link to="/features" class="hover:text-blue-600">Features</router-link>
          <router-link to="/login" class="hover:bg-gray-200 px-3 py-1 rounded border">Login</router-link>
          <router-link to="/register" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Register</router-link>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

