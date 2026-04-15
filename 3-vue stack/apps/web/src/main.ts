import { createApp } from "vue";
import { createPinia } from "pinia";
import { createHead } from "@unhead/vue";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth";
import "./styles/main.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(createHead());
app.use(router);
const auth = useAuthStore();
void auth.fetchMe().finally(() => {
  app.mount("#app");
});
