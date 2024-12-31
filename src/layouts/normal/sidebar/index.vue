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
import { useTabStore } from "@/stores"; //对应FileTray

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
        $message.info(`[Click] ${option.label}`);
        if (option.type === "file") {
          // 发送 HTTP 请求获取数据
          axios.get(`http://127.0.0.1:8080/method?method=${option.path}`)
            .then(response => {
              // 假设返回的数据在response.data中
              console.log("请求返回的结果:", response.data);

              // 在这里处理返回的数据，比如将数据更新到树形节点中
              // 或者做其他的操作
              // 例如：将返回的数据保存到节点的数据中
              option.data = response.data;

              // 你也可以进一步更新 UI 或者处理数据
            })
            .catch(error => {
              console.error("请求数据失败:", error);
            });
          useTabStore().addTab({
            id: option.id,
            path: option.path,
            type: option.type,
            label: option.label,
            data: option.data,//option.data
          })
        }
      }
    }
  };
}

// 递归解析 JSON 数据并构建树形结构
const parseJsonToTreeData = (json, parentId = 'root', parentPath = '') => {
  const result = [];
  
  Object.keys(json).forEach((key, index) => {
    const value = json[key];
    const nodeId = `${parentId}-${index}`;
    const nodePath = `${parentPath}/${key}`;  // 更新路径，包含当前的 key

    // 如果是 methods 或 fields 且为空，跳过该节点的递归加载
    if (key === "methods" || key === "fields") {
      if (!value || value.length === 0) {
        return; // 如果为空，跳过该节点的处理
      }
    }

    // 如果值是对象，则创建一个文件夹节点
    if (typeof value === 'object' && value !== null) {
      result.push({
        id: nodeId, // 使用路径作为节点的 id
        label: key, // 路径作为 label
        type: 'folder',
        children: parseJsonToTreeData(value, nodeId, nodePath) // 递归处理嵌套的对象
      });
    } else {
      // 如果值是基本类型，则是叶子节点
      result.push({
        id: nodeId, // 使用路径作为节点的 id
        type: "file",
        path: `${nodePath}/${value}`.replace(`/${key}`,"").replace(/^\/+/, '').replace("methods/", ""),
        label: `${value}`, // 使用路径 + key + value 作为 label
        data: `当前方法为：${nodePath}/${value} 双击可反编译！！！`.replace(`/${key}`,"").replace(/^\/+/, ''),
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
    const tree = parseJsonToTreeData(response.data);
    
    // 在树形结构的最外层加上一个根节点
    treeData.value = [{
      id: "root",
      label: "test",
      type: 'folder',
      children: tree
    }];
  })
  .catch(error => {
    console.error("请求数据失败:", error);
  });
});
</script>
