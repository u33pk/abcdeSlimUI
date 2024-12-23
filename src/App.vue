<template>
  <n-config-provider class="wh-full" :theme="osThemeRef">
    <router-view v-slot="{ Component, route }">
      <component :is="Layout">
        <component :is="Component" :key="route.fullPath" />
      </component>
    </router-view>
  </n-config-provider>
</template>

<script setup>
import { darkTheme, useOsTheme } from "naive-ui";

const osThemeRef = useOsTheme().value === "dark" ? darkTheme : null;


const layouts = new Map();
function getLayout(name) {
  if (layouts.get(name)) return layouts.get(name);
  const layout = markRaw(
    defineAsyncComponent(() => import(`@/layouts/${name}/index.vue`))
  );
  layouts.set(name, layout);
  return layout;
}

const route = useRoute();
const Layout = computed(() => {
  if (!route.matched?.length) return null;
  return getLayout('normal');
});

</script>