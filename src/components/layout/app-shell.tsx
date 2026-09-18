"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Me } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "./language-switcher";

type NavItem = { href: string; labelKey: string; ready: boolean };

/** Menu per role. `ready: false` items render disabled until their phase ships. */
function navFor(roles: string[]): NavItem[] {
  const items: NavItem[] = [{ href: "/dashboard", labelKey: "dashboard", ready: true }];
  if (roles.includes("DOCTOR")) {
    items.push(
      { href: "/doctor/patients", labelKey: "patients", ready: false },
      { href: "/doctor/clinics", labelKey: "clinics", ready: false },
      { href: "/doctor/orders", labelKey: "orders", ready: false },
    );
  }
  if (roles.some((r) => ["LAB", "PLANNER"].includes(r))) {
    items.push({ href: "/lab/orders", labelKey: "labOrders", ready: false });
  }
  if (roles.some((r) => ["LAB", "PRODUCTION"].includes(r))) {
    items.push({ href: "/lab/production", labelKey: "production", ready: false });
  }
  if (roles.includes("PATIENT")) {
    items.push({ href: "/patient/treatment", labelKey: "myTreatment", ready: false });
  }
  if (roles.includes("ADMIN")) {
    items.push({ href: "/admin/users", labelKey: "users", ready: true });
  }
  return items;
}

export function AppShell({ me, children }: { me: Me; children: ReactNode }) {
  const t = useTranslations();
  const auth = useAuth();
  const pathname = usePathname();
  const nav = navFor(me.roles);
  const displayName = me.person ? `${me.person.firstName} ${me.person.lastName}` : (me.name ?? me.username);
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {t("app.name")}
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {nav.map((item) =>
              item.ready ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                    pathname.startsWith(item.href) && "bg-muted font-medium",
                  )}
                >
                  {t(`nav.${item.labelKey}`)}
                </Link>
              ) : (
                <span
                  key={item.href}
                  className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
                  title={t("app.comingSoon")}
                >
                  {t(`nav.${item.labelKey}`)}
                </span>
              ),
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials || "?"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{me.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {me.person && (
                  <DropdownMenuItem render={<Link href="/profile" />}>{t("nav.profile")}</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => auth.signoutRedirect()}>{t("auth.signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
