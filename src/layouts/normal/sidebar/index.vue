<template>
  <div class="cus-tree-container mt-4 flex-1">
    <n-tree
      class="cus-scroll-x"
      block-line
      expand-on-click
      key-field="id"
      :data="treeData"
      :node-props="nodeProps"
      :on-update:expanded-keys="updatePrefixWithExpaned"
    />
  </div>
</template>

<style scoped>
.cus-tree-container {
  width: 100%; /* Adjust based on your layout needs */
  overflow-x: auto; /* Allow horizontal scrolling */
}

.cus-scroll-x {
  min-width: 500px; /* Or adjust based on your content */
  white-space: nowrap; /* Prevent wrapping */
}
</style>

<script setup>
import { h, ref, onMounted } from "vue";
import { NIcon } from "naive-ui";
import { FileTrayFullOutline, Folder, FolderOpenOutline } from "@vicons/ionicons5";
import axios from "axios";  // 引入 axios

// 树形结构的数据
const treeData = ref([]);

// 更新树的前缀图标
const updatePrefixWithExpaned = (_keys, _option, meta) => {
  if (!meta.node) return;
  switch (meta.action) {
    case "expand":
      meta.node.prefix = () => h(NIcon, null, {
        default: () => h(FolderOpenOutline)
      });
      break;
    case "collapse":
      meta.node.prefix = () => h(NIcon, null, {
        default: () => h(Folder)
      });
      break;
  }
};

const nodeProps = ({ option }) => {
  return {
    onClick() {
      if (!option.children && !option.disabled) {
        console.log(`[Click] ${option.label}`);
      }
    }
  };
};

// 递归解析 JSON 数据并构建树形结构
const parseJsonToTreeData = (json, parentId = 'root') => {
  const result = [];
  Object.keys(json).forEach((key, index) => {
    const value = json[key];
    const nodeId = `${parentId}-${index}`;

    // 如果值是对象，则创建一个文件夹节点
    if (typeof value === 'object' && value !== null) {
      result.push({
        id: nodeId,
        label: key,
        type: 'folder',
        children: parseJsonToTreeData(value, nodeId) // 递归处理嵌套的对象
      });
    } else {
      // 如果值是基本类型，则是叶子节点
      result.push({
        id: nodeId,
        label: `${key}: ${value}`,
        type: "file",
        data: "2222222",
        prefix: () => h(NIcon, null, {
          default: () => h(FileTrayFullOutline)
        })
      });
    }
  });
  return result;
};

// 在组件挂载后，通过 HTTP 请求获取数据并初始化树形数据
onMounted(() => {
  // 发送请求
  axios.get("http://127.0.0.1:8080/classes?abc=", {
  headers: {
    'Access-Control-Allow-Origin': '*',  // 例如添加Authorization头部
  }
})
    .then(response => {
      // 打印返回的 JSON 数据
      console.log("请求返回的数据:", response.data);
      
      // 请求成功后，解析获取的 JSON 数据并设置到 treeData 中
      treeData.value = parseJsonToTreeData(response.data);
    })
    .catch(error => {
      console.error("请求数据失败:", error);
    });
});
</script>
