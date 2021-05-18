import Vue from "vue";
import VueRouter from "vue-router";
import Crowdsale from "../views/Crowdsale.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Crowdsale",
    component: Crowdsale
  },
  {
    path: "/about",
    name: "About",
    component: About
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
