<template>
    <div class="editor overflow-hidden flex-col" >
        <div class="overflow-hidden flex-1">
            <codemirror v-model="code" :style="{
                width: preview ? '50%' : '100%',
                height: '100%',
                backgroundColor: '#fff',
                color: '#333',
            }" placeholder="Please enter the code." :extensions="extensions" :autofocus="config.autofocus"
                :disabled="config.disabled" :indent-with-tab="config.indentWithTab" :tab-size="config.tabSize"
                @update="handleStateUpdate" @ready="handleReady" />
        </div>
        <div class="footer">
            <div class="buttons">
                <n-button type="error" tertiary round class="m-r-5" @click="handleUndo">撤销</n-button>
                <n-button type="success" tertiary round class="m-r-5" @click="handleRedo">恢复</n-button>
            </div>
            <div class="infos">
                <span class="item">缩进: {{ config.tabSize }}</span>
                <span class="item">长度: {{ state.length }}</span>
                <span class="item">行数: {{ state.lines }}</span>
                <span class="item">光标: {{ state.cursor }}</span>
                <span class="item">已选择: {{ state.selected }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { redo, undo } from '@codemirror/commands'
import { Codemirror } from 'vue-codemirror'

// Props
const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    theme: [],
    keyId: {
        type: String,
        required: true
    },
    language: Function
})

const log = console.log
const code = ref(props.code)

const extensions = computed(() => {
    const result = []
    if (props.language) {
        result.push(props.language())
    }
    if (props.theme) {
        result.push(props.theme)
    }
    return result
})

let cmView = ref(null)
const handleReady = ({ view }) => {
    cmView = view
}

// Handle Undo and Redo
const handleUndo = () => {
    if (cmView) {
        undo({
            state: cmView.state,
            dispatch: cmView.dispatch
        })
    }
}

const handleRedo = () => {
    if (cmView) {
        redo({
            state: cmView.state,
            dispatch: cmView.dispatch
        })
    }
}

const state = reactive({
    lines: null,
    cursor: null,
    selected: null,
    length: null
})


const handleStateUpdate = (viewUpdate) => {
    // selected
    const ranges = viewUpdate.state.selection.ranges
    state.selected = ranges.reduce((plus, range) => plus + range.to - range.from, 0)
    state.cursor = ranges[0].anchor
    // length
    state.length = viewUpdate.state.doc.length
    state.lines = viewUpdate.state.doc.lines
}

// Watch for code prop change
onMounted(() => {
    watch(
        () => props.code,
        (_code) => {
            console.log('code changed:', _code)
            code.value = _code
        }
    )
    watch(
        () => $store.tab.findTabs(props.keyId).refresh,
        (_refresh) => {
            code.value = $store.tab.findTabs(props.keyId).data
        }
    )
})
</script>

<style lang="scss" scoped>
.editor {
    .divider {
        height: 1px;
        background-color: #000;
    }

    .main {
        display: flex;
        width: 100%;

        .code {
            width: 30%;
            height: 100px;
            margin: 0;
            padding: 0.4em;
            overflow: scroll;
            border-left: 1px solid #000;
            font-family: monospace;
        }
    }

    .footer {
        height: 3rem;
        padding: 0 1em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 90%;

        .infos {
            .item {
                margin-left: 2em;
                display: inline-block;
                font-feature-settings: 'tnum';
            }
        }
    }
}
</style>