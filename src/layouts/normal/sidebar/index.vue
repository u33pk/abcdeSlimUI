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
          // 发送第三个请求
          return axios.get(`http://127.0.0.1:8080/classes?abc=${abcpath}`, {
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


// 在组件挂载后，通过 HTTP 请求获取数据并初始化树形数据
// onMounted(() => {
//   // 发送请求
//   axios.get("http://127.0.0.1:8080/classes?abc=360/ets/modules.abc", {
//     headers: {
//       'Access-Control-Allow-Origin': '*',  // 例如添加Authorization头部
//     }
//   })
//   .then(response => {
//     // 打印返回的 JSON 数据
//     console.log("请求返回的数据:", response.data);
    
//     // 请求成功后，解析获取的 JSON 数据并设置到 treeData 中
//     const tree = parseJsonToTreeData(response.data);
    
//     // 在树形结构的最外层加上一个根节点
//     treeData.value = [{
//       id: "root",
//       label: "test",
//       type: 'folder',
//       children: tree
//     }];
//   })
//   .catch(error => {
//     console.error("请求数据失败:", error);
//   });
// });
</script>
