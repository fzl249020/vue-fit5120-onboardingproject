<template>
  <section class="min-h-[70vh] flex flex-col bg-gray-50">
    <!-- 背景大图 + 标题（改进版） -->
    <div class="relative h-72 md:h-96 flex items-center justify-center text-center overflow-hidden">
      <!-- 背景图（带模糊） -->
      <div
        class="absolute inset-0 bg-cover bg-center"
        style="background-image:url('/images/contact.png'); filter: blur(2px);"
      ></div>

      <!-- 半透明黑色遮罩 -->
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>

      <!-- 标题 -->
      <h1 class="relative text-white text-3xl md:text-5xl font-extrabold font-serif drop-shadow-lg px-4">
        For better transport services in Melbourne!
      </h1>
    </div>

    <!-- 内容区 -->
    <div class="max-w-5xl mx-auto px-4 py-10 flex-1">
      <p class="text-gray-700 leading-8 mb-10 text-lg">
        If you have any troubles with Melbourne parking and need our help, or have
        any profound suggestions for improving parking in Melbourne, please contact us immediately!
        Your feedback helps us make city transport more efficient and convenient.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 电话 -->
        <div class="rounded-xl border shadow-sm p-6 bg-white flex items-center gap-4">
          <img src="/images/phone.png" alt="phone icon" class="w-12 h-12 rounded-full object-cover" />
          <div>
            <h3 class="font-semibold text-lg mb-1">Phone</h3>
            <p class="text-gray-700">+61 3 9000 1234</p>
            <p class="text-gray-500 text-sm mt-1">Mon–Fri, 0:00–24:00 AEST</p>
          </div>
        </div>

        <!-- 邮箱 -->
        <div class="rounded-xl border shadow-sm p-6 bg-white flex items-center gap-4">
          <img src="/images/email.png" alt="email icon" class="w-12 h-12 rounded-full object-cover" />
          <div>
            <h3 class="font-semibold text-lg mb-1">Email</h3>
            <p class="text-gray-700">hello@melbparking.example</p>
            <p class="text-gray-500 text-sm mt-1">We usually reply within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
