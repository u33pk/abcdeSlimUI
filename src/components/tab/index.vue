<template>
    <div>
        <n-tabs :value="tabStore.activeTab" :closable="tabStore.tabs.length > 1"
            :style="`--selected-bg: ${false ? '#1b2429' : '#eaf0f1'}`" type="card"
            @close="(id) => tabStore.removeTab(id)">
            <n-tab v-for="item in tabStore.tabs" :key="item.id" :name="item.id" @click="handleItemClick(item.id)"
                @contextmenu.prevent="handleContextMenu($event, item)">
                {{ item.label }}
            </n-tab>
        </n-tabs>

        <ContextMenu v-if="contextMenuOption.show" v-model:show="contextMenuOption.show"
            :current-id="contextMenuOption.currentId" :x="contextMenuOption.x" :y="contextMenuOption.y" />
    </div>
</template>

<script setup>
import ContextMenu from './ContextMenu.vue'
import { useTabStore } from '@/stores'

const router = useRouter()
const tabStore = useTabStore()

const contextMenuOption = reactive({
    show: false,
    x: 0,
    y: 0,
    currentId: '',
})

const handleItemClick = (id) => {
    tabStore.setActiveTab(id)
}

function showContextMenu() {
    contextMenuOption.show = true
}
function hideContextMenu() {
    contextMenuOption.show = false
}
function setContextMenu(x, y, currentId) {
    Object.assign(contextMenuOption, { x, y, currentId })
}

// 右击菜单
async function handleContextMenu(e, tagItem) {
    const { clientX, clientY } = e
    hideContextMenu()
    setContextMenu(clientX, clientY, tagItem.id)
    await nextTick()
    showContextMenu()
}
</script>

<style scoped lang="scss">
:deep(.n-tabs) {
    .n-tabs-tab {
        padding-left: 16px;
        height: 36px;
        background: transparent !important;
        border-radius: 4px !important;
        margin-right: 4px;

        &:hover {
            border: 1px solid var(--primary-color) !important;
        }
    }

    .n-tabs-tab--active {
        border: 1px solid var(--primary-color) !important;
        background-color: var(--selected-bg) !important;
    }

    .n-tabs-pad,
    .n-tabs-tab-pad,
    .n-tabs-scroll-padding {
        border: none !important;
    }
}
</style>