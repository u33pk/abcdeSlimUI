<template>
  <!-- Main Page -->
  <div class="w-screen flex-row border-style-double h-40 justify-start">
    <n-button type="success" class="mr-5" @click="openCreateProjectModal">
      创建项目
    </n-button>
    <n-button type="success" class="mr-5" @click="openLoadProjectModal">
      加载项目
    </n-button>
    <n-button type="success" class="mr-5" @click="openUploadModal">
      上传Hap
    </n-button>
    <n-button type="success" class="mr-5" @click="handleDecompile">
      Hap反编译
    </n-button>
    <n-button type="success" class="mr-5" @click="jshandleDecompile">
      Js全部反编译
    </n-button>
    <n-button type="success" class="mr-5" @click="openSearchModal">
      搜   索
    </n-button>
    <n-button type="success" class="mr-5" @click="openSettingsModal">
      设   置
    </n-button>
    <n-button type="success" class="mr-5" @click="openHelpModal">
      帮   助
    </n-button>
  </div>

  <!-- Sidebar and Content Area -->
  <div class="wh-full flex">
    <!-- Sidebar -->
    <aside
      class="flex-col flex-shrink-0 transition-width-300"
      :style="{ width: sidebarWidth + 'px' }"
      border-r="1px solid light_border dark:dark_border"
    >
      <SideBar />
    </aside>

    <!-- Resizable Divider -->
    <div class="resize-handle" @mousedown="startDrag"></div>

    <!-- Content Area -->
    <article class="w-0 flex flex-col flex-1 h-screen" style="height: calc(100vh - 40px);">
      <n-tabs
        type="line"
        v-model:value="activeTab"
        :bar-width="60"
        :tabs-padding="20"
        animated
        class="custom-tabs"
      >
        <n-tab-pane name="tab1" tab="代码查看">
          <template #tab>
            <n-icon><FileTray /></n-icon>
            <span class="ml-2">代码查看</span>
          </template>
        </n-tab-pane>
        <n-tab-pane name="tab2" tab="CFG结构">
          <template #tab>
            <n-icon><Settings /></n-icon>
            <span class="ml-2">CFG结构</span>
          </template>
        </n-tab-pane>
        <n-tab-pane name="tab3" tab="汇编代码">
          <template #tab>
            <n-icon><Code /></n-icon>
            <span class="ml-2">汇编代码</span>
          </template>
        </n-tab-pane>
        <!-- 新增的 tab4 用于展示搜索结果 -->
        <n-tab-pane name="tab4" tab="搜索结果">
          <template #tab>
            <n-icon><Search /></n-icon>
            <span class="ml-2">搜索结果</span>
          </template>
        </n-tab-pane>
      </n-tabs>

      <!-- 内容区域 -->
      <div class="h-screen flex-col" v-show="activeTab === 'tab1'">
        <AppHeader class="h-60 flex-shrink-0" />
        <slot />
      </div>
      <div class="h-screen flex-col" v-show="activeTab === 'tab2'">
        <CfgPage />
      </div>
      <div class="h-screen flex-col" v-show="activeTab === 'tab3'">
        <AsmPage />
      </div>
        <!-- 搜索结果展示区域 -->
<!-- 搜索结果展示区域 -->
<div class="h-screen flex-col" v-show="activeTab === 'tab4'">
    <!-- 展示查询内容 -->
    <div class="search-query-display">
      <n-text strong>查询内容：</n-text>
      <n-text>{{ displayedSearchKey }}</n-text>
    </div>

    <!-- 展示查询结果 -->
    <n-spin :show="isLoading">
      <div class="search-results-container" style="overflow: auto; max-height: 600px;">
        <n-data-table
          :columns="searchResultColumns"
          :data="highlightedSearchResults"
          :scroll-x="1000"
          :scroll-y="500"
        />
      </div>
    </n-spin>
  </div>

      <!-- 未打开文件时的提示 -->
      <n-empty class="h-screen mt-15%" v-show="tabsCount === 0" description="暂未打开文件">
        <template #icon>
          <n-icon>
            <FileTray />
          </n-icon>
        </template>
      </n-empty>
    </article>
  </div>

  <!-- Upload Modal -->
  <div v-if="isUploadModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <n-form label-width="80px" class="modal-form">
        <n-form-item label="选择文件">
          <input type="file" @change="handleFileChange" />
        </n-form-item>
        <n-space justify="center">
          <n-button type="primary" @click="handleUploadFile">确认</n-button>
          <n-button @click="closeUploadModal">取消</n-button>
        </n-space>
      </n-form>
    </div>
  </div>

  <!-- Create Project Modal -->
  <div v-if="isCreateProjectModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <n-form label-width="80px" class="modal-form">
        <n-form-item label="项目名称">
          <n-input v-model:value="projectName" placeholder="请输入项目名称" />
        </n-form-item>
        <n-space justify="center">
          <n-button type="primary" @click="handleCreateProject">确认</n-button>
          <n-button @click="closeCreateProjectModal">取消</n-button>
        </n-space>
      </n-form>
    </div>
  </div>

  <!-- Load Project Modal -->
  <div v-if="isLoadProjectModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <n-form label-width="80px" class="modal-form">
        <n-form-item label="选择项目">
          <n-select
            v-model:value="selectedProject"
            :options="projectOptions"
            placeholder="请选择项目"
            :dropdown-props="{ style: { zIndex: 300 } }"
          />
        </n-form-item>
        <n-space justify="center">
          <n-button type="primary" @click="handleLoadProject">确认</n-button>
          <n-button @click="closeLoadProjectModal">取消</n-button>
        </n-space>
      </n-form>
    </div>
  </div>

  <!-- Search Modal -->
  <div v-if="isSearchModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <n-form label-width="80px" class="modal-form">
        <n-form-item label="搜索内容">
          <n-input v-model:value="searchKey" placeholder="请输入搜索内容" />
        </n-form-item>
        <n-space justify="center">
          <n-button type="primary" @click="handleSearch">确认</n-button>
          <n-button @click="closeSearchModal">取消</n-button>
        </n-space>
      </n-form>
    </div>
  </div>

  <!-- Help Modal -->
  <div v-if="isHelpModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <n-form label-width="200px" class="modal-form">
        <n-form-item label="版本信息">
          <div v-if="versionInfo" class="version-info">
            <p><strong>abcde:</strong> <a :href="versionInfo.abcde" target="_blank">{{ versionInfo.abcde }}</a></p>
            <p><strong>abcdeSlim:</strong> <a :href="versionInfo.abcdeSlim" target="_blank">{{ versionInfo.abcdeSlim }}</a></p>
            <p><strong>abcdeSlimUI:</strong> <a :href="versionInfo.abcdeSlimUI" target="_blank">{{ versionInfo.abcdeSlimUI }}</a></p>
            <p><strong>作者:</strong></p>
            <ul>
              <li v-for="author in versionInfo.author" :key="author">{{ author }}</li>
            </ul>
          </div>
          <n-empty v-else description="正在加载版本信息...">
            <template #icon>
              <n-icon>
                <FileTray />
              </n-icon>
            </template>
          </n-empty>
        </n-form-item>
        <n-space justify="center">
          <n-button @click="closeHelpModal">关闭</n-button>
        </n-space>
      </n-form>
    </div>
  </div>

  <!-- Settings Modal -->
  <div v-if="isSettingsModalOpen" class="overlay flex justify-center items-center">
    <div class="modal-container">
      <div class="modal-form">
        <n-input v-model:value="AIServer" placeholder="请输入AIServer地址" class="mb-4" />
        <n-input v-model:value="AIKey" placeholder="请输入AIKey" class="mb-4" />
        <n-input v-model:value="AIModule" placeholder="请输入AIModule" class="mb-4" />
        <n-space justify="center">
          <n-button type="primary" @click="handleSettingsSubmit">确认</n-button>
          <n-button @click="closeSettingsModal">取消</n-button>
        </n-space>
      </div>
    </div>
  </div>

  <!-- 引入代码2的组件 -->
  <TreeComponent ref="treeComponentRef" />
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import AppHeader from "./header/index.vue";
import { FileTray, Settings, Code, Search } from "@vicons/ionicons5"; // 引入图标
import SideBar from "./sidebar/index.vue";
import { useTabStore } from "@/stores";
import TreeComponent from "./sidebar/index.vue"; // 引入代码2的组件
import CfgPage from "./header/CfgPage.vue";
import AsmPage from "./header/asmpage.vue"; // 引入 asmpage.vue 组件

// State
const sidebarWidth = ref(420);
const isDragging = ref(false);
const isCreateProjectModalOpen = ref(false);
const isLoadProjectModalOpen = ref(false);
const projectName = ref("");
const isUploadModalOpen = ref(false);
const selectedFile = ref(null);
const projectOptions = ref([]); // 项目列表数据
const selectedProject = ref(null); // 用户选择的项目
const treeComponentRef = ref(null); // 代码2组件的引用
const activeTab = ref("tab1"); // 当前激活的选项卡
const isHelpModalOpen = ref(false);
const isjshandleDecompile = ref(false);
const versionInfo = ref(null);

// 搜索相关的状态
const isSearchModalOpen = ref(false);
const searchKey = ref("");
const displayedSearchKey = ref("");
const searchResults = ref([]);
const isLoading = ref(false);

// 修改表格列定义，添加操作按钮
// 修改表格列定义，添加操作按钮
const searchResultColumns = ref([
{
    title: '操作',
    key: 'actions',
    render(row) {
      return h(
        'div',
        { class: 'action-button-container' },
        [
          h(
            'n-button',
            {
              type: 'primary',
              size: 'small',
              class: 'jump-button',
              onClick: () => handleJumpToDecompile(row)
            },
            '跳转反编译'
          )
        ]
      );
    }
  },{ title: '结果', key: 'result', render(row) {
    return h('div', {
      innerHTML: row.result
    });
  }}
]);

// 高亮匹配的查询内容
const highlightedSearchResults = computed(() => {
  const keyword = displayedSearchKey.value;
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 转义特殊字符
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return searchResults.value.map(result => ({
    result: result.result.replace(regex, '<span style="color: red;">$1</span>')
  }));
});

// 右键菜单相关状态
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const selectedRow = ref(null);

// 获取每一行的内容
const rowProps = (row) => {
  return {
    onContextmenu: (e) => handleContextMenu(e, row)
  };
};

// 右键菜单处理函数
const handleContextMenu = (e, row) => {
  e.preventDefault();
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  selectedRow.value = row; // 保存当前行的内容
  showContextMenu.value = true;
  console.log("Treesdsdas"+selectedRow.value);
  // 监听全局点击事件
  document.addEventListener('click', handleGlobalClick);
};


// 全局点击事件处理函数
const handleGlobalClick = (e) => {
  // 判断点击的位置是否在菜单之外
  if (!e.target.closest('.context-menu')) {
    showContextMenu.value = false;
    // 移除全局点击事件监听器
    document.removeEventListener('click', handleGlobalClick);
  }
};


// 跳转反编译处理函数
const handleJumpToDecompile = (row) => {
  if (treeComponentRef.value && row) {
    window.decompileclas(cleanedText(row.result));
    activeTab.value = "tab1"; // 切换到 tab1
  } else {
    console.error("TreeComponent 实例未找到或行数据无效");
  }
};

const cleanedText = (data) => {
      // 去除 <span style="color: red;"> 和 </span>
      data = data.replace(/<span style="color: red;">/g, '');
      data = data.replace(/<\/span>/g, '');
      return data;
};

// // 跳转反编译处理函数
// const handleJumpToDecompile = () => {
//   if (treeComponentRef.value && selectedRow.value) {
//     //treeComponentRef.value.decompileclass(selectedRow.value.result); // 传递当前行的内容
//     window.decompileclas(selectedRow.value.result);
//     activeTab.value = "tab1"; // 切换到 tab1
//   } else {
//     window.decompileclas(row.value.result);
//     activeTab.value = "tab1"; // 切换到 tab1
//     console.error("TreeComponent 实例未找到或行数据无效");
//   }
//   showContextMenu.value = false; // 关闭右键菜单
//   // 移除全局点击事件监听器
//   document.removeEventListener('click', handleGlobalClick);
// };


// 设置相关的状态
const isSettingsModalOpen = ref(false);
const AIServer = ref("");
const AIKey = ref("");
const AIModule = ref("");

// Computed properties
const tabsCount = computed(() => useTabStore().tabs.length);

// Sidebar drag handlers
const startDrag = (e) => {
  isDragging.value = true;
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const onMouseMove = (e) => {
    if (isDragging.value) {
      const delta = e.clientX - startX;
      sidebarWidth.value = Math.max(64, Math.min(800, startWidth + delta));
    }
  };

  const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDrag);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopDrag);
};

// Create Project
const openCreateProjectModal = () => {
  isCreateProjectModalOpen.value = true;
};

const closeCreateProjectModal = () => {
  isCreateProjectModalOpen.value = false;
  projectName.value = "";
};

const handleCreateProject = async () => {
  if (!projectName.value) {
    alert("请输入项目名称！");
    return;
  }

  try {
    const encodedProjectName = encodeURIComponent(projectName.value); // 编码项目名称
    const response = await axios.get(`http://127.0.0.1:8080/space/create?space=${encodedProjectName}`);
    alert("项目创建成功！");
    closeCreateProjectModal();
  } catch (error) {
    alert("项目创建失败，请稍后重试！");
    console.error("Create project error:", error);
  }
};

// Load Project
const openLoadProjectModal = async () => {
  isLoadProjectModalOpen.value = true;
  try {
    const response = await axios.get("http://127.0.0.1:8080/space/all");
    projectOptions.value = response.data.map((project) => ({
      label: project,
      value: project,
    }));
  } catch (error) {
    alert("获取项目列表失败，请稍后重试！");
    console.error("Fetch project list error:", error);
  }
};

const closeLoadProjectModal = () => {
  isLoadProjectModalOpen.value = false;
  selectedProject.value = null;
};

const handleLoadProject = async () => {
  if (!selectedProject.value) {
    alert("请选择一个项目！");
    return;
  }

  try {
    const encodedProjectName = encodeURIComponent(selectedProject.value); // 编码项目名称
    const response = await axios.get(`http://127.0.0.1:8080/space/load?space=${encodedProjectName}`);
    console.log("第一个接口返回的数据:", response.data);
    // 发送第一个请求获取 space/list 的数据
    axios.get("http://127.0.0.1:8080/space/list")
      .then(response => {
        // 获取第一个接口返回的数据
        const firstResponseData = response.data;
        console.log("第1个接口返回的数据:", firstResponseData);

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
    alert("项目加载成功！");
    closeLoadProjectModal();
  } catch (error) {
    alert("项目加载失败，请稍后重试！");
    console.error("Load project error:", error);
  }
};

// Upload File
const openUploadModal = () => {
  isUploadModalOpen.value = true;
};

const closeUploadModal = () => {
  isUploadModalOpen.value = false;
  selectedFile.value = null;
};

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const handleUploadFile = async () => {
  if (!selectedFile.value) {
    alert("请先选择一个文件！");
    return;
  }

  const formData = new FormData();
  const encodedFileName = encodeURIComponent(selectedFile.value.name); // 编码文件名
  formData.append("xxx.hap", selectedFile.value, encodedFileName); // 添加编码后的文件名

  try {
    const response = await axios.post("http://127.0.0.1:8080/space/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data == "upload success") {
      console.log("文件上传成功！:", response.data);
      alert("文件上传成功！");
    }
    closeUploadModal();
  } catch (error) {
    alert("文件上传失败，请稍后重试！");
    console.error("Upload error:", error);
  }
};

// 反编译按钮点击事件
const handleDecompile = () => {
  if (treeComponentRef.value) {
    treeComponentRef.value.decompile(); // 调用代码2的反编译函数
  } else {
    console.error("TreeComponent 实例未找到");
  }
};

// js反编译 Modal
const jshandleDecompile = async () => {
  isjshandleDecompile.value = true;
  try {
    alert("全部反编译开始, 留意token数量！");
    const response = await axios.get("http://127.0.0.1:8080/method/all");
    versionInfo.value = response.data;
  } catch (error) {
    alert("全部反编译失败，请稍后重试！");
    console.error("Fetch version info error:", error);
  }
};

// Search Modal
const openSearchModal = () => {
  isSearchModalOpen.value = true;
};

// 搜索功能
const handleSearch = async () => {
  if (!searchKey.value) {
    alert("请输入搜索内容！");
    return;
  }

  isLoading.value = true; // 开始加载
  try {
    const startTime = Date.now();
    const response = await axios.get(`http://127.0.0.1:8080/method/search?key=${encodeURIComponent(searchKey.value)}`);
    const endTime = Date.now();
    const duration = endTime - startTime; // 计算查询时间

    // 模拟加载动画持续时间
    await new Promise(resolve => setTimeout(resolve, duration));

    searchResults.value = response.data.map(result => ({ result: result })); // 假设返回的数据结构是数组，每个元素包含一个 result 字段
    displayedSearchKey.value = searchKey.value; // 保存查询内容
    activeTab.value = "tab4"; // 切换到搜索结果选项卡
    closeSearchModal();
  } catch (error) {
    alert("搜索失败，请稍后重试！");
    console.error("Search error:", error);
  } finally {
    isLoading.value = false; // 结束加载
  }
};

// 关闭搜索模态框
const closeSearchModal = () => {
  isSearchModalOpen.value = false;
  searchKey.value = ""; // 清空输入框内容，但 displayedSearchKey 仍然保留
};

// Help Modal
const openHelpModal = async () => {
  isHelpModalOpen.value = true;
  try {
    const response = await axios.get("http://127.0.0.1:8080/misc/version");
    versionInfo.value = response.data;
  } catch (error) {
    alert("获取版本信息失败，请稍后重试！");
    console.error("Fetch version info error:", error);
  }
};

const closeHelpModal = () => {
  isHelpModalOpen.value = false;
  versionInfo.value = null;
};

// Settings Modal
const openSettingsModal = () => {
  isSettingsModalOpen.value = true;
};

const closeSettingsModal = () => {
  isSettingsModalOpen.value = false;
  AIServer.value = "";
  AIKey.value = "";
  AIModule.value = "";
};

const handleSettingsSubmit = async () => {
  
  // if (!AIServer.value || !AIKey.value || !AIModule.value) {
  //   alert("请填写所有字段！");
  //   return;
  // }

  const configData = {
    AIServer: AIServer.value,
    AIKey: AIKey.value,
    AIModule: AIModule.value,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  axios.post('http://127.0.0.1:8080/misc/config', configData, { headers })
    .then(response => {
      console.log('Response:', response.data);
      alert("配置更新成功！");
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error:', error);
    });
};
</script>

<style scoped>

/* 新增样式 */
.search-query-display {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* 新增样式 */
.search-results-container {
  height: calc(100% - 80px); /* 调整为 80px 以确保有足够的空间 */
  overflow-y: auto; /* 垂直滚动 */
  overflow-x: auto; /* 水平滚动 */
  padding: 16px; /* 添加一些内边距 */
  box-sizing: border-box; /* 确保内边距和边框包含在宽度和高度内 */
}

/* 确保表格内容能够正确滚动 */
.n-data-table {
  height: 100%;
  width: 100%;
  box-sizing: border-box; /* 确保内边距和边框包含在宽度和高度内 */
}

/* 加载动画样式 */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 样式部分保持不变 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  width: 500px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 100; /* 确保模态框在最前面 */
}

.modal-form {
  display: flex;
  flex-direction: column;
}

.mb-4 {
  margin-bottom: 1rem;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 8px 0;
  border-radius: 4px;
}

.context-menu div {
  padding: 8px 16px;
  cursor: pointer;
}

.context-menu div:hover {
  background-color: #f0f0f0;
}

/* 操作按钮容器样式 */
.action-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 跳转按钮样式 */
.jump-button {
  background-color: #409eff; /* 蓝色背景 */
  color: white; /* 白色文字 */
  border: none; /* 去掉边框 */
  border-radius: 4px; /* 圆角 */
  padding: 6px 12px; /* 内边距 */
  font-size: 12px; /* 字体大小 */
  cursor: pointer; /* 鼠标指针 */
  transition: background-color 0.3s ease; /* 背景色过渡效果 */
}

.jump-button:hover {
  background-color: #66b1ff; /* 鼠标悬停时的背景色 */
}

.jump-button:active {
  background-color: #3a8ee6; /* 按钮按下时的背景色 */
}
</style>