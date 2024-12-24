<template>
  <div class="cus-tree-container mt-4 flex-1">
    <n-tree
      class="cus-scroll-x"
      block-line
      expand-on-click
      key-field="id"
      :data="data"
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
import {
  FileTrayFullOutline,
  Folder,
  FolderOpenOutline
} from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { useTabStore } from "@/stores";


const updatePrefixWithExpaned = (_keys, _option, meta) => {
  if (!meta.node)
    return;
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
          useTabStore().addTab({
            id: option.id,
            type: option.type,
            label: option.label,
            data: option.data,
          })
        }
      }
    }
  };
}
const data = [
  {
    id: "1",
    type: "folder",
    label: "文件夹",
    data: "",
    prefix: () => h(NIcon, null, {
      default: () => h(Folder)
    }),
    children: [
      {
        id: "2",
        label: "空的",
        type: "folder",
        data: "",
        disabled: true,
        prefix: () => h(NIcon, null, {
          default: () => h(Folder)
        })
      },
      {
        id: "3",
        label: "我的文件",
        type: "folder",
        data: "",
        prefix: () => h(NIcon, null, {
          default: () => h(Folder)
        }),
        children: [
          {
            id: "4",
            label: "template.js",
            type: "file",
            data: "11111111111",
            prefix: () => h(NIcon, null, {
              default: () => h(FileTrayFullOutline)
            })
          },
          {
            id: "5",
            label: "test.js",
            type: "file",
            data: "2222222",
            prefix: () => h(NIcon, null, {
              default: () => h(FileTrayFullOutline)
            })
          }
        ]
      },{
        id: "6",
        label: "我的文件",
        type: "folder",
        data: "",
        prefix: () => h(NIcon, null, {
          default: () => h(Folder)
        }),
        children: [
          {
            id: "7",
            label: "template.js",
            type: "file",
            data: "11111111111",
            prefix: () => h(NIcon, null, {
              default: () => h(FileTrayFullOutline)
            })
          },
          {
            id: "8",
            label: "test.js",
            type: "file",
            data: "admin",
            prefix: () => h(NIcon, null, {
              default: () => h(FileTrayFullOutline)
            })
          }
        ]
      }
    ]
  }
]
</script>
