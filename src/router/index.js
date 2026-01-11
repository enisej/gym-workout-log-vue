import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Exercises from "../views/Exercises.vue";
import AddWorkout from "../views/AddWorkout.vue";
import History from "../views/History.vue";
import Stats from "../views/Stats.vue";
import Profile from "../views/Profile.vue";
import EditWorkout from "../views/EditWorkout.vue";
import Auth from "../views/Auth.vue";
import { useGymStore } from "../stores/useGymStore";

const routes = [
  { path: "/auth", component: Auth, meta: { requiresAuth: false } },
  { path: "/", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/exercises", component: Exercises, meta: { requiresAuth: true } },
  { path: "/add", component: AddWorkout, meta: { requiresAuth: true } },
  { path: "/history", component: History, meta: { requiresAuth: true } },
  { path: "/stats", component: Stats, meta: { requiresAuth: true } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/edit/:id", component: EditWorkout, meta: { requiresAuth: true } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useGymStore();
  store.loadUserFromStorage();

  const requiresAuth = to.meta.requiresAuth !== false;
  const isAuthenticated = !!store.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next("/auth");
  } else if (to.path === "/auth" && isAuthenticated) {
    next("/");
  } else {
    next();
  }
});
