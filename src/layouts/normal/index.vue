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
      反编译
    </n-button>
    <n-button type="success" @click="query">
      查  询
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
      <div class="h-screen flex-col" v-if="tabsCount > 0">
        <AppHeader class="h-60 flex-shrink-0" />
        <slot />
      </div>
      <n-empty class="h-screen mt-15%" v-else description="暂未打开文件">
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

    <!-- 引入代码2的组件 -->
    <TreeComponent ref="treeComponentRef" />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import AppHeader from "./header/index.vue";
import { FileTray } from "@vicons/ionicons5";
import SideBar from "./sidebar/index.vue";
import { useTabStore } from "@/stores";
import TreeComponent from "./sidebar/index.vue"; // 引入代码2的组件

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

// 反编译按钮点击事件
const handleDecompile = () => {
  if (treeComponentRef.value) {
    treeComponentRef.value.decompile(); // 调用代码2的反编译函数
  } else {
    console.error("TreeComponent 实例未找到");
  }
};
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
    const response = await axios.get(`http://127.0.0.1:8080/space/create?space=${projectName.value}`);
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
    const response = await axios.get(`http://127.0.0.1:8080/space/load?space=${selectedProject.value}`);
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
  formData.append("xxx.hap", selectedFile.value);

  try {
    const response = await axios.post("http://127.0.0.1:8080/space/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("文件上传成功！");
    closeUploadModal();
  } catch (error) {
    alert("文件上传失败，请稍后重试！");
    console.error("Upload error:", error);
  }
};

// Decompile
const decompile = () => {
  alert("反编译功能待实现");
};

// Query
const query = () => {
  alert("查询功能待实现");
};
</script>

<style scoped>
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
  width: 400px;
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

.resize-handle {
  width: 10px;
  cursor: ew-resize;
  background-color: #ccc;
  height: 100%;
}
</style>