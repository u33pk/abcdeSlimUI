<template>
  <main class="flex-grow overflow-hidden bg-#f5f6fb p-x-20">
    <transition name="fade-slide" mode="out-in" appear>
      <main class="h-full overflow-hidden"><slot /></main>
    </transition>
    <TheFooter v-if="showFooter" class="mb-12 mt-auto h-10" />
  </main>
</template>

<script setup>
defineProps({
  showFooter: {
    type: Boolean,
    default: false,
  },
})
</script>
