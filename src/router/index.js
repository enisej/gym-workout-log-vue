import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Exercises from "../views/Exercises.vue";
import AddWorkout from "../views/AddWorkout.vue";
import History from "../views/History.vue";
import Stats from "../views/Stats.vue";
import Profile from "../views/Profile.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/exercises", component: Exercises },
  { path: "/add", component: AddWorkout },
  { path: "/history", component: History },
  { path: "/stats", component: Stats },
  { path: "/profile", component: Profile },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
