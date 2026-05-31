import type { App } from "vue";
import { i18n } from "@src/i18n";

export default (app: App) => {
  app.use(i18n);
};
