"use client";

import { useFormatter, useTranslations } from "next-intl";
import { FollowUpList, useFollowUps } from "@/features/followups";
import { useMe } from "@/features/identity";
import { OrderStatusBadge, ShipmentCard, useOrder, useOrders, type Order } from "@/features/orders";
import { useMyDoctors } from "@/features/patients";
import { PlanDetails, PlanMedia, usePlans } from "@/features/planning";
import { parseLocalDate } from "@/shared/lib/dates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function PatientTreatmentPage() {
  const t = useTranslations();
  const format = useFormatter();
  const me = useMe();
  const doctors = useMyDoctors();
  const orders = useOrders();
  // Terminal or draft orders carry nothing the patient needs to see.
  const active = (orders.data ?? []).filter((o) => !["DRAFT", "CANCELLED", "REJECTED"].includes(o.status));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("portal.title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("portal.doctors")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {doctors.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("portal.noDoctors", { email: me.data?.email ?? "" })}</p>
          )}
          {doctors.data?.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">
                  Dr. {d.firstName} {d.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{d.specialty ?? ""}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("portal.since", { date: format.dateTime(parseLocalDate(d.since), { dateStyle: "medium" }) })}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {orders.data && active.length === 0 && (
        <Card className="opacity-70">
          <CardHeader>
            <CardTitle>{t("nav.myTreatment")}</CardTitle>
            <CardDescription>{t("portal.treatmentSoon")}</CardDescription>
          </CardHeader>
        </Card>
      )}
      {active.map((o) => (
        <PatientOrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}

/** One treatment as the patient sees it: status, doctor and, once approved, the plan. */
function PatientOrderCard({ order }: { order: Order }) {
  const t = useTranslations();
  const format = useFormatter();
  const plans = usePlans(order.id);
  const full = useOrder(order.id);          // the list omits the shipment
  const followUps = useFollowUps(order.id);
  const approved = plans.data?.find((p) => p.approval) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>
            {t("portal.treatment")} #{order.orderNumber} · {t(`orders.form.arch${order.arch}`)}
          </span>
          <OrderStatusBadge status={order.status} />
        </CardTitle>
        <CardDescription>
          {order.doctorName} · {format.dateTime(new Date(order.createdAt), { dateStyle: "medium" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {approved ? (
          <>
            <PlanDetails plan={approved} showApproval={false} />
            <PlanMedia plan={approved} editable={false} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("portal.planPending")}</p>
        )}
        {full.data?.shipment && <ShipmentCard shipment={full.data.shipment} />}
        {followUps.data && followUps.data.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("portal.evolution")}</h3>
            <FollowUpList followUps={followUps.data} editable={false} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
