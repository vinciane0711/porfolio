<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
</script>

<template>
  <div class="border border-b-gray-300 py-4 px-8 flex gap-2">
    <router-link to="/">Home</router-link>
    <router-link to="/map">Map</router-link>
    <router-link to="/taiwan">Taiwan</router-link>
    <router-link to="/north-population">North-pop</router-link>
  </div>

  <RouterView />
</template>
