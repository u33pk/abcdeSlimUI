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

// 暴露一个全局函数，用于更新 method 路径
const decompileclas = (data) => {

  // 发送 HTTP 请求获取数据
  const mathodencodedPath = encodeURIComponent(data);
  // 将 option.path 传递给脚本2
  if (window.updateCfgPath) {
        window.updateCfgPath(mathodencodedPath); // 调用脚本2的全局函数
      }
      if (window.updateAsmPath) {
        window.updateAsmPath(mathodencodedPath); // 调用脚本2的全局函数
      }

  // 遍历 rootNode2 的子节点，查找匹配的 path
  const rootNode2 = treeData.value.find(node => node.id === "2");
  if (rootNode2 && rootNode2.children) {
    const matchedNode = findNodeByPath(rootNode2.children, data);
    if (matchedNode) {
      axios.get(`http://127.0.0.1:8080/method?method=${mathodencodedPath}`)
    .then(response => {
      console.log("请求返回的结果:", response.data);
      matchedNode.data = response.data;
    })
      // 如果找到匹配的节点，填充对应的数据
      useTabStore().addTab({
        id: matchedNode.id,
        path: matchedNode.path,
        type: matchedNode.type,
        label: matchedNode.label,
        data: matchedNode.data,
      });
    } else {
      console.warn("未找到匹配的 path:", data);
    }
  } else {
    console.warn("rootNode2 不存在或没有子节点");
  }
};

// 递归查找匹配的 path
const findNodeByPath = (nodes, path) => {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// 将全局函数挂载到 window 对象
window.decompileclas = decompileclas;

const nodeProps = ({ option }) => {
  return {
    onClick() {
      if (!option.children && !option.disabled) {
        $message.info(`[Click] ${option.label}`);
        if (option.type === "file") {
          
          // 发送 HTTP 请求获取数据
          const mathodencodedPath = encodeURIComponent(option.path);
          // 将 option.path 传递给脚本2
          if (window.updateCfgPath) {
                window.updateCfgPath(mathodencodedPath); // 调用脚本2的全局函数
              }
              if (window.updateAsmPath) {
                window.updateAsmPath(mathodencodedPath); // 调用脚本2的全局函数
              }
          axios.get(`http://127.0.0.1:8080/method?method=${mathodencodedPath}`)
            .then(response => {
              console.log("请求返回的结果:", response.data);
              option.data = response.data;

              
            })
            .catch(error => {
              console.error("请求数据失败:", error);
            });
          useTabStore().addTab({
            id: option.id,
            path: option.path,
            type: option.type,
            label: option.label,
            data: option.data,
          });
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

const parseJsonToTreeDatajson = (json, parentId = 'root', parentPath = '') => {
  const result = [];

  // 如果是数组，遍历数组
  if (Array.isArray(json)) {
    json.forEach((item, index) => {
      const nodeId = `${parentId}-${index}`;
      const nodePath = `${parentPath}/${item.name || item.id}`; // 假设每个项有 name 或 id 字段

      // 如果数组项是对象，递归处理
      if (typeof item === 'object' && item !== null) {
        result.push({
          id: nodeId,
          label: item.name || item.id, // 使用 name 或 id 作为 label
          type: 'folder', // 假设是文件夹
          children: parseJsonToTreeData(item, nodeId, nodePath), // 递归处理
        });
      } else {
        // 如果数组项是基本类型，直接作为叶子节点
        result.push({
          id: nodeId,
          label: `${item}`, // 使用值作为 label
          type: 'file', // 假设是文件
          path: nodePath,
          data: item, // 保存原始数据
        });
      }
    });
  }
  // 如果是对象，遍历对象
  else if (typeof json === 'object' && json !== null) {
    Object.keys(json).forEach((key, index) => {
      const value = json[key];
      const nodeId = `${parentId}-${index}`;
      const nodePath = `${parentPath}/${key}`;

      // 如果值是对象或数组，递归处理
      if (typeof value === 'object' && value !== null) {
        result.push({
          id: nodeId,
          label: key,
          type: 'folder', // 假设是文件夹
          children: parseJsonToTreeData(value, nodeId, nodePath), // 递归处理
        });
      } else {
        // 如果值是基本类型，直接作为叶子节点
        result.push({
          id: nodeId,
          label: `${key}: ${value}`, // 使用键值对作为 label
          type: 'file', // 假设是文件
          path: nodePath,
          data: value, // 保存原始数据
        });
      }
    });
  }
  // 如果是基本类型，直接作为叶子节点
  else {
    result.push({
      id: parentId,
      label: `${json}`, // 使用值作为 label
      type: 'file', // 假设是文件
      path: parentPath,
      data: json, // 保存原始数据
    });
  }

  return result;
};

// 反编译函数
const decompile = () => {
  console.log("反编译功能被调用");

  // 发送第一个请求获取 space/list 的数据
  axios.get("http://127.0.0.1:8080/space/list")
    .then(response => {
      // 获取第一个接口返回的数据
      const firstResponseData = response.data;
      console.log("第一个接口返回的数据:", firstResponseData);

      // 假设第一个接口返回的数据是一个字符串或对象，提取出 test
      const test = firstResponseData[0]; // 根据实际返回的数据结构进行调整

      // 发送第二个请求，使用第一个接口返回的数据作为参数
      return axios.get(`http://127.0.0.1:8080/hap?file=${test}`)
        .then(secondResponse => {
          // 获取第二个接口返回的 JSON 数据
          const secondResponseData = secondResponse.data;
          console.log("第二个接口返回的数据:", secondResponseData);   
          // 在所有异步操作完成后刷新页面
          window.location.reload(); 
        });
    })
    .catch(error => {
      console.error("请求数据失败:", error);
    });
};

// 判断节点是否为空白节点的辅助函数
const isEmptyNode = (node) => {
  if (!node) return true; // 节点为空
  if (typeof node === 'object' && Object.keys(node).length === 0) return true; // 空对象
  if (Array.isArray(node) && node.length === 0) return true; // 空数组
  return false; // 非空白节点
};

onMounted(() => {
  console.log("反编译功能被调用");

  // 发送第一个请求获取 space/list 的数据
  axios.get("http://127.0.0.1:8080/space/list")
    .then(response => {
      // 获取第一个接口返回的数据
      const firstResponseData = response.data;
      console.log("第一个接口返回的数据:", firstResponseData);

      // 假设第一个接口返回的数据是一个字符串或对象，提取出 test
      const test = firstResponseData[0]; // 根据实际返回的数据结构进行调整

      // 发送第二个请求，使用第一个接口返回的数据作为参数
      return axios.get(`http://127.0.0.1:8080/hap?file=${test}`)
        .then(secondResponse => {
          // 获取第二个接口返回的 JSON 数据
          const secondResponseData = secondResponse.data;
          console.log("第二个接口返回的数据:", secondResponseData);

          // 解析第二个接口返回的 JSON 数据，并去除空白节点
          const tree1 = parseJsonToTreeData(secondResponseData).filter(node => !isEmptyNode(node));

          // 设置根节点的 label 为第一个接口返回的数据名称
          const rootNode1 = {
            id: "1",
            label: firstResponseData[0], // 使用第一个接口返回的数据名称作为根节点的 label
            type: 'folder',
            children: tree1
          };
          
          const abcpath = findPathsContainingABC(secondResponseData)[0];
          // 对 path 进行 URL 编码
          const abcencodedPath = encodeURIComponent(abcpath);
          // 发送第三个请求
          return axios.get(`http://127.0.0.1:8080/classes?abc=${abcencodedPath}`, {
            headers: {
              'Access-Control-Allow-Origin': '*',  // 例如添加Authorization头部
            }
          })
            .then(thirdResponse => {
              // 打印返回的 JSON 数据
              console.log("第三个请求返回的数据:", thirdResponse.data);

              // 解析第三个请求返回的 JSON 数据，并去除空白节点
              const tree2 = parseJsonToTreeData(thirdResponse.data)

              // 设置第二个根节点
              const rootNode2 = {
                id: "2",
                label: abcpath,
                type: 'folder',
                children: tree2
              };

              // 将两个根节点合并到一个数组中
              treeData.value = [rootNode1, rootNode2];
            })
            .catch(error => {
              console.error("第三个请求数据失败:", error);
            });
        });
    })
    .catch(error => {
      console.error("请求数据失败:", error);
    });
});


function findPathsContainingABC(jsonData, keyword = 'abc') {
  const paths = [];

  const search = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        search(obj[key]); // 递归遍历子节点
      } else if (key === 'path' && obj[key].includes(keyword)) {
        paths.push(obj[key]); // 如果 path 包含关键字，添加到结果中
      }
    }
  };

  search(jsonData); // 开始搜索
  return paths;
}

// 暴露函数给父组件
defineExpose({
  decompile,
});

</script>