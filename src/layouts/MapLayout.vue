<template>
  <div class="grow flex overflow-hidden relative">
    <slot />
  </div>

  <!-- <aside class="flex flex-col p-8 border-l border-gray-300 bg-gray-50 gap-2">
    <slot name="aside"></slot>
  </aside> -->

  <div
    class="tooltip p-4 text-sm text-gray-800 absolute bg-white/80 rounded-md text-center pointer-events-none -translate-x-1/2 -translate-y-full transition after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-t-white/80 after:border-l-transparent after:border-r-transparent after:border-b-transparent"
  />
</template>
