import { defineStore } from "pinia";
import { useRouter,useRoute } from 'vue-router'


export const useRouterStore = defineStore("router", () => {
  const router = useRouter();
  const route = useRoute();

  return {
    router,
    route,
  };
});

export default useRouterStore;
