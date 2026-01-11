import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./style.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

import { useGymStore } from "./stores/useGymStore";
const store = useGymStore();
store.loadUserFromStorage();

app.mount("#app");
