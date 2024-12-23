<template>
  <AppPage class="flex-col" show-footer>
    <div class="h-full flex-col">
      <Toolbar :config="config" :disabled="loading" :themes="Object.keys(themes)" :languages="Object.keys(languages)"
        @language="ensureLanguageCode" />
      <keep-alive>
        <Editer v-show="activeIndex === index" v-for="(tab, index) in tabs"  :key="tab.id" :keyId="tab.id" :code="tab.data" class="h-full" v-if="currentLangCode" :config="config" :theme="currentTheme"
          :language="currentLangCode.language" />
      </keep-alive>
    </div>
  </AppPage>
</template>


<script setup>
import Toolbar from '@/components/codemirror/toolbar.vue'
import Editer from '@/components/codemirror/editor.vue'
import languages from '@/components/codemirror/languages'
import { Theme, useTheme } from '@/components/codemirror/theme'
import * as themes from '@/components/codemirror/themes'


const tabs = computed(() => $store.tab.tabs)
const activeIndex = computed(() => $store.tab.activeIndex)


const langCodeMap = reactive(new Map())
const currentLangCode = computed(() => langCodeMap.get(config.language))
const currentTheme = computed(() => {
  return config.theme !== 'default' ? (themes)[config.theme] : void 0
})

const ensureLanguageCode = async (targetLanguage) => {
  config.language = targetLanguage
  if (!langCodeMap.has(targetLanguage)) {
    const [result] = await Promise.all([languages[targetLanguage]()])
    langCodeMap.set(targetLanguage, result.default)
  }
}

// Init language
onBeforeMount(() => {
  ensureLanguageCode(config.language)
})

const config = reactive({
  disabled: false,
  indentWithTab: true,
  tabSize: 2,
  autofocus: true,
  height: 'auto',
  language: 'javascript',
  theme: useTheme().theme.value === Theme.Dark ? 'oneDark' : 'rosePineDawn'
})
</script>
