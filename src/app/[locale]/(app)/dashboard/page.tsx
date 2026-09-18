"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/lib/query";

type Tile = { href: string; title: string; description: string; ready: boolean };

export default function DashboardPage() {
  const t = useTranslations();
  const me = useMe();
  if (!me.data) return null;
  const { roles, person, tenant } = me.data;

  const sections: { title: string; tiles: Tile[] }[] = [];
  if (roles.includes("DOCTOR")) {
    sections.push({
      title: t("dashboard.doctor.title"),
      tiles: [
        { href: "/doctor/patients", title: t("nav.patients"), description: t("dashboard.doctor.patients"), ready: false },
        { href: "/doctor/orders", title: t("nav.orders"), description: t("dashboard.doctor.orders"), ready: false },
        { href: "/doctor/clinics", title: t("nav.clinics"), description: t("dashboard.doctor.clinics"), ready: false },
      ],
    });
  }
  if (roles.some((r) => ["LAB", "PLANNER", "PRODUCTION"].includes(r))) {
    sections.push({
      title: t("dashboard.lab.title"),
      tiles: [
        { href: "/lab/orders", title: t("nav.labOrders"), description: t("dashboard.lab.orders"), ready: false },
        { href: "/lab/production", title: t("nav.production"), description: t("dashboard.lab.production"), ready: false },
      ],
    });
  }
  if (roles.includes("PATIENT")) {
    sections.push({
      title: t("dashboard.patient.title"),
      tiles: [
        { href: "/patient/treatment", title: t("nav.myTreatment"), description: t("dashboard.patient.treatment"), ready: false },
      ],
    });
  }
  if (roles.includes("ADMIN")) {
    sections.push({
      title: t("dashboard.admin.title"),
      tiles: [{ href: "/admin/users", title: t("nav.users"), description: t("dashboard.admin.users"), ready: true }],
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("dashboard.welcome", { name: person ? person.firstName : (me.data.name ?? me.data.username) })}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>
            {t("dashboard.roleLabel")}:{" "}
            {roles.filter((r) => r in { ADMIN: 1, DOCTOR: 1, PATIENT: 1, LAB: 1, PLANNER: 1, PRODUCTION: 1, ACCOUNTING: 1, REPRESENTATIVE: 1 })
              .map((r) => (
                <Badge key={r} variant="secondary" className="mr-1">
                  {t(`roles.${r}`)}
                </Badge>
              ))}
          </span>
          {tenant && (
            <span>
              · {t("dashboard.tenantLabel")}: {tenant.name}
            </span>
          )}
        </div>
      </div>

      {sections.map((s) => (
        <section key={s.title} className="space-y-3">
          <h2 className="text-lg font-medium">{s.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.tiles.map((tile) =>
              tile.ready ? (
                <Link key={tile.href} href={tile.href}>
                  <Card className="h-full transition hover:border-primary">
                    <CardHeader>
                      <CardTitle>{tile.title}</CardTitle>
                      <CardDescription>{tile.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ) : (
                <Card key={tile.href} className="h-full opacity-60">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tile.title}
                      <Badge variant="outline">{t("app.comingSoon")}</Badge>
                    </CardTitle>
                    <CardDescription>{tile.description}</CardDescription>
                  </CardHeader>
                </Card>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
