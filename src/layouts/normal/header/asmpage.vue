<template>
  <div class="asm-page">
    <h2>汇编代码展示</h2>
    <pre>{{ asmPath }}</pre>
    <pre>{{ asmCode }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const asmCode = ref(""); // 存储汇编代码
const asmPath = ref(""); // 存储汇编代码

// 定义全局函数
window.updateAsmPath = function (path) {
  console.log("Received path:", path);
  fetchAsmCode(path); // 调用获取汇编代码的函数
};

// 获取汇编代码的函数
const fetchAsmCode = async (path) => {
  try {
    const response = await axios.get(`http://127.0.0.1:8080/method/asm?method=${path}`);
    console.log("Assembly code data:", response.data);
    asmPath.value = `AsmPath: ${path}`; // 更新页面状态
    asmCode.value = response.data; // 更新页面状态
  } catch (error) {
    console.error("Failed to fetch assembly code:", error);
    asmCode.value = "Failed to load assembly code.";
  }
};
</script>

<style scoped>
.asm-page {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  max-height: calc(100vh - 200px);
  margin: 20px;
  border: 1px solid #ddd;
}

pre {
  margin: 0;
}
</style>