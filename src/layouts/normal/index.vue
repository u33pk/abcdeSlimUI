<template>
  <div class="w-screen text-center flex-row border-style-double h-40">
    <n-button type="success">
      Button1
    </n-button>
    <n-button type="success">
      Button2
    </n-button>
    <n-button type="success">
      Button3
    </n-button>

  </div>
  <div class="wh-full flex">
    <aside class="flex-col flex-shrink-0 transition-width-300" :class="false ? 'w-64' : 'w-220'"
      border-r="1px solid light_border dark:dark_border">
      <SideBar />
    </aside>
    <article class="w-0 flex flex-col flex-1 h-screen" style="height: calc(100vh - 40px);">
      <div class="h-screen flex-col" v-if="tabsCount > 0">
        <AppHeader class="h-60 flex-shrink-0" />
        <slot />
      </div>
      <n-empty class="h-screen mt-15%" v-else description="暂未打开文件">
        <template #icon>
          <n-icon>
            <FileTray />
          </n-icon>
        </template>
      </n-empty>
    </article>
  </div>
</template>

<script setup>
import AppHeader from './header/index.vue'
import { FileTray } from '@vicons/ionicons5'
import SideBar from './sidebar/index.vue'
import { useTabStore } from "@/stores";
const id = computed(() => { console.log($store.tab.activeIndex); return $store.tab.activeIndex });
const tabsCount = computed(() => useTabStore().tabs.length);
</script>

<style>
.collapsed {
  width: 64px;
}
</style>