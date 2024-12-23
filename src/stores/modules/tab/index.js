import { defineStore } from "pinia";

export const useTabStore = defineStore("tab", {
  state: () => ({
    tabs: [],
    activeTab: "",
    reloading: false,
  }),
  getters: {
    activeIndex() {
      return this.tabs.findIndex((item) => item.id === this.activeTab);
    },
  },
  actions: {
    async setActiveTab(id) {
      await nextTick(); // tab栏dom更新完再设置激活，让tab栏定位到新增的tab上生效
      this.activeTab = id;
    },
    findTabs(id) {
      return this.tabs.find((item) => item.id === id);
    },
    setTabs(tabs) {
      this.tabs = tabs;
    },
    addTab(tab = {}) {
      tab.refresh = false
      const findIndex = this.tabs.findIndex((item) => item.id === tab.id);
      if (findIndex !== -1) {
        this.tabs.splice(findIndex, 1, tab);
      } else {
        this.setTabs([...this.tabs, tab]);
      }
      this.setActiveTab(tab.id);
    },
    async reloadTab(id) {
      const findItem = this.tabs.find((item) => item.id === id);
      if (!findItem) return;
      $loadingBar.start();
      this.reloading = true;
      await nextTick();
      this.reloading = false;
      findItem.refresh = findItem?.refresh === undefined ? true : !findItem.refresh;
      setTimeout(() => {
        document.documentElement.scrollTo({ left: 0, top: 0 });
        $loadingBar.finish();
      }, 100);
    },
    async removeTab(id) {
      this.setTabs(this.tabs.filter((tab) => tab.id !== id));
    },
    removeOther(curId = this.activeTab) {
      this.setTabs(this.tabs.filter((tab) => tab.path === curId));
    },
    removeLeft(curId) {
      const curIndex = this.tabs.findIndex((item) => item.id === curId);
      const filterTabs = this.tabs.filter((item, index) => index >= curIndex);
      this.setTabs(filterTabs);
    },
    removeRight(curId) {
      const curIndex = this.tabs.findIndex((item) => item.id === curId);
      const filterTabs = this.tabs.filter((item, index) => index <= curIndex);
      this.setTabs(filterTabs);
    },
    resetTabs() {
      this.$reset();
    },
  },
  persist: {
    paths: ["tabs"],
    storage: sessionStorage,
  },
});

export default useTabStore;
