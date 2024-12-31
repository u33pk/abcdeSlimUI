<template>
  <div class="w-screen flex-row border-style-double h-40 justify-start">
    <n-button type="success" class="mr-5">
      打  开
    </n-button>
    <n-button type="success" class="mr-5">
      反编译
    </n-button>
    <n-button type="success">
      查  询
    </n-button>
  </div>
  <div class="wh-full flex">
    <!-- Sidebar with resizable feature -->
    <aside
      class="flex-col flex-shrink-0 transition-width-300"
      :style="{ width: sidebarWidth + 'px' }"
      border-r="1px solid light_border dark:dark_border"
    >
      <SideBar />
    </aside>

    <!-- Resizable Divider -->
    <div
      class="resize-handle"
      @mousedown="startDrag"
    ></div>

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
import { ref, computed } from 'vue'
import AppHeader from './header/index.vue'
import { FileTray } from '@vicons/ionicons5'
import SideBar from './sidebar/index.vue'
import { useTabStore } from "@/stores"

const sidebarWidth = ref(420) // Initial sidebar width 修改旁边默认宽度
const isDragging = ref(false)

const id = computed(() => { console.log($store.tab.activeIndex); return $store.tab.activeIndex })
const tabsCount = computed(() => useTabStore().tabs.length)

// Mouse event handlers for dragging the sidebar width
const startDrag = (e) => {
  isDragging.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value

  const onMouseMove = (e) => {
    if (isDragging.value) {
      const delta = e.clientX - startX
      sidebarWidth.value = Math.max(64, Math.min(800, startWidth + delta)) // Min width 64px, Max width 400px 修改旁边可拉默认宽度
    }
  }

  const stopDrag = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopDrag)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.collapsed {
  width: 64px;
}

/* Style for the draggable handle */
.resize-handle {
  width: 10px; /* Width of the handle */
  cursor: ew-resize; /* Horizontal resize cursor */
  background-color: #ccc; /* Light gray divider color */
  height: 100%; /* Full height of the container */
}
</style>
