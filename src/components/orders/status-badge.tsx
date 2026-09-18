"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api";

const TONE: Record<OrderStatus, string> = {
  DRAFT: "bg-muted text-foreground",
  SUBMITTED: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  DIAGNOSIS_PAID: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100",
  IN_PLANNING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  PLAN_SENT: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100",
  CHANGES_REQUESTED: "bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100",
  APPROVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  TREATMENT_PAID: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  IN_PRODUCTION: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100",
  SHIPPED: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100",
  IN_FOLLOW_UP: "bg-teal-100 text-teal-900 dark:bg-teal-900/40 dark:text-teal-100",
  CLOSED: "bg-muted text-muted-foreground",
  REJECTED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
  CANCELLED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const t = useTranslations("orders.statuses");
  return (
    <Badge variant="outline" className={cn("border-transparent", TONE[status], className)}>
      {t(status)}
    </Badge>
  );
}
