"use client";

import { useFormatter, useTranslations } from "next-intl";
import { OrderStatusBadge } from "./status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Order } from "../types";

export function OrderTimeline({ order: o }: { order: Order }) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orders.timeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 border-l pl-4 text-sm">
          {o.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatusBadge status={h.toStatus} />
                <span className="text-muted-foreground">
                  {format.dateTime(new Date(h.changedAt), { dateStyle: "medium", timeStyle: "short" })}
                </span>
                {h.changedByName && <span className="text-muted-foreground">· {h.changedByName}</span>}
              </div>
              {h.note && <p className="mt-1 text-muted-foreground">{h.note}</p>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
