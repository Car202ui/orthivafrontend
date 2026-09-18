"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatusBadge, useOrders } from "@/features/orders";
import { PatientForm, usePatient, useUpdatePatient, type PatientInput } from "@/features/patients";
import { useApiErrorToast } from "@/shared/api/errors";
import { Link } from "@/shared/i18n/navigation";
import { parseLocalDate } from "@/shared/lib/dates";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

function age(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = parseLocalDate(birthDate);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) a -= 1;
  return a;
}

export default function PatientRecordPage() {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const { id } = useParams<{ id: string }>();
  const [editing, setEditing] = useState(false);

  const patient = usePatient(id);
  const orders = useOrders({ patientId: id });
  const update = useUpdatePatient(id);

  const submit = (input: PatientInput) =>
    update.mutate(input, {
      onSuccess: () => {
        toast.success(t("patients.updated"));
        setEditing(false);
      },
      onError,
    });

  if (patient.isError) return <p className="text-destructive">{t("patients.notFound")}</p>;
  const p = patient.data;
  if (!p) return null;
  const years = age(p.birthDate);

  const row = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[160px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value ?? "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/doctor/patients" className="text-sm text-muted-foreground hover:underline">
            ← {t("patients.title")}
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold tracking-tight">
            {p.firstName} {p.lastName}
            <Badge variant={p.hasLogin ? "default" : "secondary"}>
              {p.hasLogin ? t("patients.hasLogin") : t("patients.noLogin")}
            </Badge>
          </h1>
        </div>
        <Button variant="outline" onClick={() => setEditing(true)}>
          {t("patients.edit")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("patients.record")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {row(t("profile.documentId"), p.documentId)}
            {row(t("profile.birthDate"), p.birthDate ? `${p.birthDate}${years !== null ? ` · ${t("patients.age", { age: years })}` : ""}` : null)}
            {row(t("profile.gender"), p.gender ? t(`profile.gender${p.gender}`) : null)}
            {row(t("patients.email"), p.email)}
            {row(t("patients.phone"), p.phoneNumber ? `${p.phoneCountry ?? ""} ${p.phoneNumber}` : null)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t("patients.orders")}
              <Link href={`/doctor/orders/new?patientId=${p.id}`}>
                <Button size="sm">{t("orders.new")}</Button>
              </Link>
            </CardTitle>
            <CardDescription>{orders.data?.length === 0 ? t("orders.empty") : null}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {orders.data?.map((o) => (
              <Link key={o.id} href={`/doctor/orders/${o.id}`} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted">
                <span>
                  #{o.orderNumber} · {t(`orders.form.arch${o.arch}`)}
                </span>
                <OrderStatusBadge status={o.status} />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("patients.edit")}</DialogTitle>
          </DialogHeader>
          <PatientForm initial={p} onSubmit={submit} onCancel={() => setEditing(false)} pending={update.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
