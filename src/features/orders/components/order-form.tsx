"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import type { Order, OrderInput } from "../types";

const NONE = "__none__";

/** Choice for the patient/clinic selects; the page resolves them from their own features. */
export type OrderFormOption = { id: string; label: string };

export function OrderForm({
  initial,
  presetPatientId,
  patients,
  clinics,
  onSubmit,
  pending,
  submitLabel,
}: {
  initial?: Order | null;
  presetPatientId?: string | null;
  patients: OrderFormOption[];
  clinics: OrderFormOption[];
  onSubmit: (input: OrderInput) => void;
  pending?: boolean;
  submitLabel: string;
}) {
  const t = useTranslations();

  const schema = z.object({
    patientId: z.string().min(1, t("validation.required")),
    clinicId: z.string(),
    arch: z.enum(["UPPER", "LOWER", "BOTH"]),
    firstTime: z.boolean(),
    reevaluation: z.boolean(),
    treatmentGoal: z.string().max(4000).optional().or(z.literal("")),
    movements: z.array(
      z.object({
        toothFdi: z.string().regex(/^(1[1-8]|2[1-8]|3[1-8]|4[1-8])?$/, "11–48"),
        torque: z.string().max(80).optional().or(z.literal("")),
        rotation: z.string().max(80).optional().or(z.literal("")),
        buccolingual: z.string().max(80).optional().or(z.literal("")),
        mesiodistal: z.string().max(80).optional().or(z.literal("")),
        intrusionExtrusion: z.string().max(80).optional().or(z.literal("")),
        notes: z.string().max(2000).optional().or(z.literal("")),
      }),
    ),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: initial?.patientId ?? presetPatientId ?? "",
      clinicId: initial?.clinicId ?? NONE,
      arch: initial?.arch ?? "BOTH",
      firstTime: initial?.firstTime ?? true,
      reevaluation: initial?.reevaluation ?? false,
      treatmentGoal: initial?.treatmentGoal ?? "",
      movements:
        initial?.movements.map((m) => ({
          toothFdi: m.toothFdi ? String(m.toothFdi) : "",
          torque: m.torque ?? "",
          rotation: m.rotation ?? "",
          buccolingual: m.buccolingual ?? "",
          mesiodistal: m.mesiodistal ?? "",
          intrusionExtrusion: m.intrusionExtrusion ?? "",
          notes: m.notes ?? "",
        })) ?? [],
    },
  });
  const movements = useFieldArray({ control: form.control, name: "movements" });

  const submit = (v: Values) =>
    onSubmit({
      patientId: v.patientId,
      clinicId: v.clinicId === NONE ? null : v.clinicId,
      arch: v.arch,
      firstTime: v.firstTime,
      reevaluation: v.reevaluation,
      treatmentGoal: v.treatmentGoal || undefined,
      movements: v.movements.map((m) => ({
        toothFdi: m.toothFdi ? Number(m.toothFdi) : null,
        torque: m.torque || null,
        rotation: m.rotation || null,
        buccolingual: m.buccolingual || null,
        mesiodistal: m.mesiodistal || null,
        intrusionExtrusion: m.intrusionExtrusion || null,
        notes: m.notes || null,
      })),
    });

  const movementField = (index: number, name: keyof Values["movements"][number], label: string) => (
    <FormField
      control={form.control}
      name={`movements.${index}.${name}` as const}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs">{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("orders.form.patient")}</FormLabel>
                <Select
                  items={Object.fromEntries(patients.map((p) => [p.id, p.label]))}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!!initial}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("orders.form.selectPatient")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clinicId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("orders.form.clinic")}</FormLabel>
                <Select
                  items={{ [NONE]: t("orders.form.selectClinic"), ...Object.fromEntries(clinics.map((c) => [c.id, c.label])) }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>{t("orders.form.selectClinic")}</SelectItem>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="arch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("orders.form.arch")}</FormLabel>
                <Select
                  items={{ UPPER: t("orders.form.archUPPER"), LOWER: t("orders.form.archLOWER"), BOTH: t("orders.form.archBOTH") }}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(["UPPER", "LOWER", "BOTH"] as const).map((a) => (
                      <SelectItem key={a} value={a}>
                        {t(`orders.form.arch${a}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" {...form.register("firstTime")} />
              {t("orders.form.firstTime")}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" {...form.register("reevaluation")} />
              {t("orders.form.reevaluation")}
            </label>
          </div>
        </div>

        <FormField
          control={form.control}
          name="treatmentGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("orders.form.goal")}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={t("orders.form.goalPlaceholder")} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("orders.form.movements")}
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                movements.append({ toothFdi: "", torque: "", rotation: "", buccolingual: "", mesiodistal: "", intrusionExtrusion: "", notes: "" })
              }
            >
              {t("orders.form.addMovement")}
            </Button>
          </div>
          {movements.fields.map((f, i) => (
            <div key={f.id} className="rounded-md border p-3">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {movementField(i, "toothFdi", t("orders.form.tooth"))}
                {movementField(i, "torque", t("orders.form.torque"))}
                {movementField(i, "rotation", t("orders.form.rotation"))}
                {movementField(i, "buccolingual", t("orders.form.buccolingual"))}
                {movementField(i, "mesiodistal", t("orders.form.mesiodistal"))}
                {movementField(i, "intrusionExtrusion", t("orders.form.intrusionExtrusion"))}
              </div>
              <div className="mt-3 flex items-end gap-3">
                <div className="flex-1">{movementField(i, "notes", t("orders.form.notes"))}</div>
                <Button type="button" size="sm" variant="ghost" onClick={() => movements.remove(i)}>
                  {t("orders.form.remove")}
                </Button>
              </div>
            </div>
          ))}
        </section>

        <Button type="submit" disabled={pending}>
          {pending ? t("app.loading") : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
