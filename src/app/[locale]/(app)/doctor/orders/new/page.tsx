"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useClinics } from "@/features/clinics";
import { OrderForm, useCreateOrder, type OrderInput } from "@/features/orders";
import { usePatients } from "@/features/patients";
import { useApiErrorToast } from "@/shared/api/errors";
import { useRouter } from "@/shared/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/** Step 1 of a prescription: creates the draft, then continues on the order page (files, send). */
export default function NewOrderPage() {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const router = useRouter();
  const params = useSearchParams();
  const create = useCreateOrder();
  // The form only needs choices; the page composes them so orders/ stays independent of patients/ and clinics/.
  const patients = usePatients().data?.map((p) => ({ id: p.id, label: `${p.lastName}, ${p.firstName}` })) ?? [];
  const clinics = useClinics().data?.map((c) => ({ id: c.id, label: c.name })) ?? [];

  const submit = (input: OrderInput) =>
    create.mutate(input, {
      onSuccess: (o) => {
        toast.success(t("orders.draftSaved"));
        router.push(`/doctor/orders/${o.id}?tab=files`);
      },
      onError,
    });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("orders.new")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("orders.steps.prescription")}</CardTitle>
          <CardDescription>
            {t("orders.steps.files")} · {t("orders.steps.review")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrderForm
            presetPatientId={params.get("patientId")}
            patients={patients}
            clinics={clinics}
            onSubmit={submit}
            pending={create.isPending}
            submitLabel={t("app.continue")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
