
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";

import HomeView from '../views/HomeView.vue'
import { setupRouterGuards } from "./guards";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})



export async function setupRouter(app) {
  try {
    // ...路由初始化逻辑
  } catch (error) {
    console.error("🚀 初始化失败", error);
  }
  setupRouterGuards(router);
  app.use(router);
}
