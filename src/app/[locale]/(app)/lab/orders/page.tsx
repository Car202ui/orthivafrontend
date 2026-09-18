"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { OrderStatusBadge } from "@/components/orders/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/api";
import { useApi } from "@/lib/query";

const ALL = "__all__";
const PENDING = "__pending__";
const PENDING_STATUSES: OrderStatus[] = ["DIAGNOSIS_PAID", "IN_PLANNING", "CHANGES_REQUESTED"];

/** Laboratory inbox: every order of the tenant, defaulting to the ones that need planning work. */
export default function LabOrdersPage() {
  const t = useTranslations();
  const format = useFormatter();
  const call = useApi();
  const [filter, setFilter] = useState<string>(PENDING);

  const orders = useQuery({
    queryKey: ["orders", "lab", filter],
    queryFn: async () => {
      if (filter === PENDING) {
        const all = await call<Order[]>("/api/orders");
        return all.filter((o) => PENDING_STATUSES.includes(o.status));
      }
      return call<Order[]>(`/api/orders${filter === ALL ? "" : `?status=${filter}`}`);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("lab.inboxTitle")}</h1>
        <p className="text-muted-foreground">{t("lab.inboxSubtitle")}</p>
      </div>

      <Select
        items={{
          [PENDING]: t("lab.pending"),
          [ALL]: t("orders.allStatuses"),
          ...Object.fromEntries(ORDER_STATUSES.map((s) => [s, t(`orders.statuses.${s}`)])),
        }}
        value={filter}
        onValueChange={(v) => setFilter(v ?? PENDING)}
      >
        <SelectTrigger className="w-[260px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PENDING}>{t("lab.pending")}</SelectItem>
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
            <TableHead>{t("orders.doctor")}</TableHead>
            <TableHead>{t("orders.patient")}</TableHead>
            <TableHead>{t("orders.arch")}</TableHead>
            <TableHead>{t("orders.status")}</TableHead>
            <TableHead>{t("orders.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {t("orders.empty")}
              </TableCell>
            </TableRow>
          )}
          {orders.data?.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">
                <Link href={`/lab/orders/${o.id}`} className="hover:underline">
                  #{o.orderNumber}
                </Link>
              </TableCell>
              <TableCell>{o.doctorName}</TableCell>
              <TableCell>{o.patientName}</TableCell>
              <TableCell>{t(`orders.form.arch${o.arch}`)}</TableCell>
              <TableCell>
                <OrderStatusBadge status={o.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{format.dateTime(new Date(o.createdAt), { dateStyle: "medium" })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
