<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
</script>

<template>
  <div class="border border-b-gray-300 p-4 flex gap-2">
    <router-link to="/">Home</router-link>
    <router-link to="/north-population">North-pop</router-link>
  </div>

  <RouterView />
</template>
