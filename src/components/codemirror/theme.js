import { inject, ref, computed, readonly } from 'vue'
import storage from '@/utils/storage'

export const Theme = {
  System : 'system',
  Light : 'light',
  Dark : 'dark'
}

const THEME_STORAGE_KEY = '__theme'
export const THEMES = [Theme.System, Theme.Light, Theme.Dark]

// system theme
export const getSystemTheme = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.Dark
  }
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return Theme.Light
  }
}

// local theme
export const getLocalTheme = () => {
  const historyTheme = storage.get(THEME_STORAGE_KEY)
  if (historyTheme && THEMES.includes(historyTheme)) {
    return historyTheme
  }
}

const ThemeSymbol = Symbol('theme')
const createThemeStore = (defaultTheme) => {
  const theme = ref(defaultTheme)
  const setTheme = (newTheme) => {
    if (THEMES.includes(newTheme)) {
      theme.value = newTheme
      storage.set(THEME_STORAGE_KEY, newTheme)
    }
  }

  const systemTheme = ref(defaultTheme)
  const initOnClient = () => {
    systemTheme.value = getSystemTheme() || defaultTheme
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches }) => {
      systemTheme.value = matches ? Theme.Dark : Theme.Light
    })
  }

  const currentTheme = computed(() => {
    if (theme.value === Theme.System) {
      return systemTheme.value
    } else {
      return theme.value
    }
  })

  return {
    theme: readonly(theme),
    currentTheme,
    setTheme,
    initOnClient
  }
}


export const createTheme = (defaultTheme) => {
  const themeStore = createThemeStore(defaultTheme)
  return {
    ...themeStore,
    install(app) {
      app.provide(ThemeSymbol, themeStore)
    }
  }
}

export const useTheme = () => {
  return inject(ThemeSymbol)
}
