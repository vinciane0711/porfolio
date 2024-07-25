<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
</script>

<template>
  <div
    class="border border-b-gray-300 p-4 flex gap-2 flex-col text-xl text-gray-500 bg-gray-100"
  >
    <router-link to="/">
      <span class="icon-[mdi--home]"></span>
    </router-link>
    <router-link to="/north-population">
      <span class="icon-[mdi--map]"></span>
    </router-link>
  </div>

  <RouterView />
</template>
