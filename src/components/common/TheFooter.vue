<template>
  <footer class="f-c-c text-14 text-gray-500">
    <p>
      Copyright © 2024
      <a
        href="javascript:;"
        class="transition"
        hover="decoration-underline color-primary"
      >
        {{ title }}
      </a>
    </p>
  </footer>
</template>

<script setup>
const title = import.meta.env.VITE_TITLE
</script>
