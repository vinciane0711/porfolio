<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div
    class="border border-b-gray-300 p-4 md:flex gap-2 flex-col text-xl text-gray-500 bg-gray-100 hidden"
  >
    <router-link to="/">
      <span class="icon-[mdi--home]"></span>
    </router-link>
  </div>

  <RouterView />
</template>
