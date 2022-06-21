import { createRouter, createWebHistory } from "vue-router";
import GeneratorView from "../views/GeneratorView.vue";
import AboutView from "../views/AboutView.vue";
import PrivacyView from "../views/PrivacyView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: GeneratorView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/privacy",
      name: "privacy",
      component: PrivacyView,
    },
  ],
});

export default router;
