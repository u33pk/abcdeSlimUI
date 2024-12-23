<template>
  <div class="toolbar ">
    <div class="item">
      <label for="language">语言:</label>
      <select name="language" id="language" :disabled="disabled" :value="config.language"
        @change="handleSelectLanguage">
        <option :value="option" :key="option" v-for="option in languages">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="item">
      <label for="theme">主题:</label>
      <select name="theme" id="theme" :disabled="disabled" v-model="config.theme">
        <option :value="option" :key="option" v-for="option in ['default', ...themes]">
          {{ option }}
        </option>
      </select>
    </div>
    <div class="item">
      <label for="disabled">禁用编辑:</label>
      <input type="checkbox" id="disabled" :disabled="disabled" v-model="config.disabled" />
    </div>
    <div class="item">
      <label for="autofocus">自动聚焦:</label>
      <input type="checkbox" id="autofocus" :disabled="disabled" v-model="config.autofocus" />
    </div>
    <div class="item">
      <label for="indentWithTab">indentWithTab:</label>
      <input type="checkbox" id="indentWithTab" :disabled="disabled" v-model="config.indentWithTab" />
    </div>
    <div class="item">
      <label for="tabSize">tabSize:</label>
      <select name="tabSize" id="tabSize" :disabled="disabled" v-model.number="config.tabSize">
        <option :value="option" :key="option" v-for="option in [2, 4, 6, 8]">
          {{ option }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    required: true
  },
  languages: {
    type: Array,
    required: true
  },
  themes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits();

const handleSelectLanguage = (event) => {
  emit('language', event.target.value)
}
</script>

<style lang="scss" scoped>

.toolbar {
  display: flex;
  flex-direction: row;
  gap:10px;
  height: 3rem;
  padding: 0 1em;

  .item {
    display: inline-flex;
    align-items: center;

    label {
      display: inline-block;
      margin-right: 0.2em;
    }
  }

  input,
  button,
  select {
    margin: 0;
  }

  select {
    max-width: 3em;
    max-width: 8em;
  }
}
</style>
