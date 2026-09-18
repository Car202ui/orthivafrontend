import { defineRouting } from "next-intl/routing";

// Adding Portuguese (Brazil) later = add "pt" here and create messages/pt.json.
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
});

export type AppLocale = (typeof routing.locales)[number];
