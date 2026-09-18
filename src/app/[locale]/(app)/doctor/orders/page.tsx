"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { ORDER_STATUSES, OrderStatusBadge, useOrders, type OrderStatus } from "@/features/orders";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

const ALL = "__all__";

export default function OrdersPage() {
  const t = useTranslations();
  const format = useFormatter();
  const [status, setStatus] = useState<string>(ALL);
  const orders = useOrders({ status: status === ALL ? null : (status as OrderStatus) });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("orders.title")}</h1>
          <p className="text-muted-foreground">{t("orders.subtitle")}</p>
        </div>
        <Link href="/doctor/orders/new">
          <Button>{t("orders.new")}</Button>
        </Link>
      </div>

      <Select
        items={{ [ALL]: t("orders.allStatuses"), ...Object.fromEntries(ORDER_STATUSES.map((s) => [s, t(`orders.statuses.${s}`)])) }}
        value={status}
        onValueChange={(v) => setStatus(v ?? ALL)}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("orders.allStatuses")}</SelectItem>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`orders.statuses.${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("orders.number")}</TableHead>
            <TableHead>{t("orders.patient")}</TableHead>
            <TableHead>{t("orders.arch")}</TableHead>
            <TableHead>{t("orders.status")}</TableHead>
            <TableHead>{t("orders.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {t("orders.empty")}
              </TableCell>
            </TableRow>
          )}
          {orders.data?.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">
                <Link href={`/doctor/orders/${o.id}`} className="hover:underline">
                  #{o.orderNumber}
                </Link>
              </TableCell>
              <TableCell>{o.patientName}</TableCell>
              <TableCell>{t(`orders.form.arch${o.arch}`)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={o.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format.dateTime(new Date(o.createdAt), { dateStyle: "medium" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
