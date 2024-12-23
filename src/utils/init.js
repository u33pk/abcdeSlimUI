import * as NaiveUI from "naive-ui";
import { createTheme, Theme } from '@/components/codemirror/theme';
import { useTabStore } from "@/stores";


export function setupMessage(NMessage) {
  class Message {
    static instance
    constructor() {
      if (Message.instance)
        return Message.instance
      Message.instance = this
      this.message = {}
      this.removeTimer = {}
    }

    removeMessage(key, duration = 5000) {
      this.removeTimer[key] && clearTimeout(this.removeTimer[key])
      this.removeTimer[key] = setTimeout(() => {
        this.message[key]?.destroy()
      }, duration)
    }

    destroy(key, duration = 200) {
      setTimeout(() => {
        this.message[key]?.destroy()
      }, duration)
    }

    showMessage(type, content, option = {}) {
      if (Array.isArray(content)) {
        return content.forEach(msg => NMessage[type](msg, option))
      }

      if (!option.key) {
        return NMessage[type](content, option)
      }

      const currentMessage = this.message[option.key]
      if (currentMessage) {
        currentMessage.type = type
        currentMessage.content = content
      }
      else {
        this.message[option.key] = NMessage[type](content, {
          ...option,
          duration: 0,
          onAfterLeave: () => {
            delete this.message[option.key]
          },
        })
      }
      this.removeMessage(option.key, option.duration)
    }

    loading(content, option) {
      this.showMessage('loading', content, option)
    }

    success(content, option) {
      this.showMessage('success', content, option)
    }

    error(content, option) {
      this.showMessage('error', content, option)
    }

    info(content, option) {
      this.showMessage('info', content, option)
    }

    warning(content, option) {
      this.showMessage('warning', content, option)
    }
  }

  return new Message()
}

export function setupDialog(NDialog) {
  NDialog.confirm = function (option = {}) {
    const showIcon = !isNullOrUndef(option.title)
    return NDialog[option.type || 'warning']({
      showIcon,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: option.confirm,
      onNegativeClick: option.cancel,
      onMaskClick: option.cancel,
      ...option,
    })
  }

  return NDialog
}


const files = import.meta.glob("../stores/modules/*/index.js", { eager: true });

// 初始化...
export function setupInit(app) {

  // 全局注册 NaiveUI API
  const { message, dialog, notification, loadingBar } =
    NaiveUI.createDiscreteApi(
      ["message", "dialog", "notification", "loadingBar"],
    );

  window.$loadingBar = loadingBar;
  window.$notification = notification;
  window.$message = setupMessage(message);
  window.$dialog = setupDialog(dialog);


  const theme = createTheme(Theme.System);
  app.use(theme)


  const modules = {};

  for (const key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      modules[files[key].default.$id] = files[key].default();
    }
  }

  window.$store = modules;


  //初始化tab
  const tabStore = useTabStore();
  tabStore.resetTabs();
  // const { name, fullPath: path } = { name: 'home', fullPath: '/' };
  // const title = "第一个文件";
  // const icon = "home";
  // const keepAlive = true;
  // tabStore.addTab({ name, path, title, icon, keepAlive });
  // tabStore.addTab({ name: '222', path: '/', title: '第二个文件', icon: '', keepAlive: true });



}