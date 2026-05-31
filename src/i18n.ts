import { createI18n } from "vue-i18n";
import siteIt from "./i18n/it/site";
import gameIt from "@game/i18n/it";

export const i18n = createI18n({
  legacy: false,
  locale: "it",
  fallbackLocale: "it",
  messages: {
    it: {
      site: siteIt,
      game: gameIt,
    },
  },
});
