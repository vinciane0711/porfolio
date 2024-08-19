<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div
    class="p-4 flex gap-4 xs:flex-col text-2xl text-gray-500 border-b xs:border-r border-gray-300"
  >
    <router-link to="/" class="flex">
      <span class="icon-[mdi--home]"></span>
    </router-link>
    <!-- <router-link to="/" class="flex">
      <span class="icon-[mdi--map]"></span>
    </router-link> -->
  </div>

  <RouterView />
</template>
