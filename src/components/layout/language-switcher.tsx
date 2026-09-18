"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function LanguageSwitcher({ onChange }: { onChange?: (locale: AppLocale) => void }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      items={Object.fromEntries(routing.locales.map((l) => [l, t(l)]))}
      value={locale}
      onValueChange={(next) => {
        router.replace(pathname, { locale: next as AppLocale });
        onChange?.(next as AppLocale);
      }}
    >
      <SelectTrigger className="w-[130px]" aria-label={t("label")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {t(l)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
