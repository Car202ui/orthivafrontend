"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import type { PaymentStatus } from "../types";

const TONE: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  APPROVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  DECLINED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
  ERROR: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const t = useTranslations("orders.paymentStatus");
  return (
    <Badge variant="outline" className={cn("border-transparent", TONE[status], className)}>
      {t(status)}
    </Badge>
  );
}
