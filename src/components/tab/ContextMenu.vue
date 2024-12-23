<template>
  <n-dropdown :show="show" :options="options" :x="x" :y="y" placement="bottom-start" @clickoutside="handleHideDropdown"
    @select="handleSelect" />
</template>

<script setup>
import { useTabStore } from '@/stores'
import { Close, Refresh, SwapHorizontalOutline, ArrowBack, ArrowForward,BanOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  currentId: {
    type: String,
    default: '',
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:show'])

const tabStore = $store.tab

const options = computed(() => [
  {
    label: '重新加载',
    key: 'reload',
    disabled: props.currentId !== tabStore.activeTab,
    icon: () => h(NIcon, null, { default: () => h(Refresh) }),
  },
  {
    label: '关闭',
    key: 'close',
    disabled: tabStore.tabs.length <= 0,
    icon: () => h(NIcon, null, { default: () => h(Close) }),
  },
  {
    label: '关闭其他',
    key: 'close-other',
    disabled: tabStore.tabs.length <= 1,
    icon: () => h(NIcon, null, { default: () => h(SwapHorizontalOutline) }),
  },
  {
    label: '关闭左侧',
    key: 'close-left',
    disabled: tabStore.tabs.length <= 1 || props.currentId === tabStore.tabs[0].path,
    icon: () => h(NIcon, null, { default: () => h(ArrowBack) }),
  },
  {
    label: '关闭右侧',
    key: 'close-right',
    disabled:
      tabStore.tabs.length <= 1 ||
      props.currentId === tabStore.tabs[tabStore.tabs.length - 1].path,
    icon: () => h(NIcon, null, { default: () => h(ArrowForward) }),

  },
  {
    label: '关闭所有',
    key: 'close-all',
    disabled: false,
    icon: () => h(NIcon, null, { default: () => h(BanOutline) }),

  },
])

const actionMap = new Map([
  [
    'reload',
    () => {
      tabStore.reloadTab(props.currentId)
    },
  ],
  [
    'close',
    () => {
      tabStore.removeTab(props.currentId)
    },
  ],
  [
    'close-other',
    () => {
      tabStore.removeOther(props.currentId)
    },
  ],
  [
    'close-left',
    () => {
      tabStore.removeLeft(props.currentId)
    },
  ],
  [
    'close-right',
    () => {
      tabStore.removeRight(props.currentId)
    },
  ],
  [
    'close-all',
    () => {
      tabStore.resetTabs()
    },
  ],
])

function handleHideDropdown() {
  emit('update:show', false)
}

function handleSelect(key) {
  const actionFn = actionMap.get(key)
  actionFn && actionFn()
  handleHideDropdown()
}
</script>
