<template>
  <main class="grow p-4 lg:p-8 flex h-full w-full overflow-hidden relative">
    <slot />
  </main>
  <div
    class="tooltip p-2 text-sm text-gray-800 absolute bg-white/80 rounded-md text-center pointer-events-none -translate-x-1/2 -translate-y-full transition after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-t-white/80 after:border-l-transparent after:border-r-transparent after:border-b-transparent shadow-md"
  />
</template>
