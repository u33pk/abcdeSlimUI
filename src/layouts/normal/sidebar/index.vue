<template>
  <n-tree class="cus-scroll-y mt-4 h-0 flex-1" block-line expand-on-click key-field="id" :data="data"
    :node-props="nodeProps" :on-update:expanded-keys="updatePrefixWithExpaned" />
</template>

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
      }
    ]
  }
]
</script>
