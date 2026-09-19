"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Shipment } from "../types";

/** Carrier / tracking of a shipped order, as doctor, patient and lab see it. */
export function ShipmentCard({ shipment: s }: { shipment: Shipment }) {
  const t = useTranslations();
  const format = useFormatter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shipping.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">{t("shipping.shippedAt")}:</span>{" "}
          {format.dateTime(new Date(s.shippedAt), { dateStyle: "medium", timeStyle: "short" })}
          {s.shippedByName ? ` · ${s.shippedByName}` : ""}
        </p>
        <p>
          <span className="text-muted-foreground">{t("shipping.carrier")}:</span> {s.carrier ?? t("shipping.noCarrier")}
        </p>
        {s.trackingNumber && (
          <p>
            <span className="text-muted-foreground">{t("shipping.tracking")}:</span> <code>{s.trackingNumber}</code>
          </p>
        )}
        {s.notes && <p className="text-muted-foreground">{s.notes}</p>}
      </CardContent>
    </Card>
  );
}
