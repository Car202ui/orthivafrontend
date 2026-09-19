"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormatter, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Address } from "@/shared/api/common";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import type { ApprovalInput, Plan } from "../types";

/** A place the doctor can ship to; the page builds these from its clinics so planning/ stays independent. */
export type ShippingPreset = { id: string; name: string; address: Address | null };

const CUSTOM = "__custom__";

export function ApprovePlanDialog({
  plan,
  open,
  onOpenChange,
  presets,
  agreementText,
  onSubmit,
  pending,
}: {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: ShippingPreset[];
  agreementText: string;
  onSubmit: (input: ApprovalInput) => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const required = t("validation.required");
  const schema = z.object({
    preset: z.string(),
    shipToClinicName: z.string().trim().min(1, required).max(120),
    country: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, t("validation.country")),
    stateProvince: z.string().trim().max(80).optional().or(z.literal("")),
    city: z.string().trim().min(1, required).max(80),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),
    line1: z.string().trim().min(1, required).max(200),
    line2: z.string().trim().max(200).optional().or(z.literal("")),
    reference: z.string().trim().max(300).optional().or(z.literal("")),
    shippingInstructions: z.string().trim().max(2000).optional().or(z.literal("")),
    agreementAccepted: z.literal(true, { errorMap: () => ({ message: t("review.agreementRequired") }) }),
  });
  type Values = z.infer<typeof schema>;

  const first = presets[0];
  const fromPreset = (p?: ShippingPreset) => ({
    shipToClinicName: p?.name ?? "",
    country: p?.address?.country ?? "",
    stateProvince: p?.address?.stateProvince ?? "",
    city: p?.address?.city ?? "",
    postalCode: p?.address?.postalCode ?? "",
    line1: p?.address?.line1 ?? "",
    line2: p?.address?.line2 ?? "",
    reference: p?.address?.reference ?? "",
  });
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { preset: first?.id ?? CUSTOM, ...fromPreset(first), shippingInstructions: "", agreementAccepted: undefined as unknown as true },
  });

  const applyPreset = (id: string | null) => {
    const p = presets.find((x) => x.id === id);
    form.setValue("preset", id ?? CUSTOM);
    Object.entries(fromPreset(p)).forEach(([k, v]) => form.setValue(k as keyof Values, v as never));
  };

  const text = (name: keyof Values, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} value={(field.value as string) ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("review.approveTitle", { version: plan.version })}</DialogTitle>
          <DialogDescription>
            {t("review.approveBody", { price: `${format.number(plan.priceTotal ?? 0)} ${plan.currency}` })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              onSubmit({
                shipToClinicName: v.shipToClinicName,
                address: {
                  country: v.country.toUpperCase(),
                  stateProvince: v.stateProvince || null,
                  city: v.city,
                  postalCode: v.postalCode || null,
                  line1: v.line1,
                  line2: v.line2 || null,
                  reference: v.reference || null,
                },
                shippingInstructions: v.shippingInstructions || undefined,
                agreementAccepted: true,
              }),
            )}
            className="space-y-4"
          >
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("review.shipTo")}</h3>
              {presets.length > 0 && (
                <FormField
                  control={form.control}
                  name="preset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("review.shipPreset")}</FormLabel>
                      <Select
                        items={{ ...Object.fromEntries(presets.map((p) => [p.id, p.name])), [CUSTOM]: t("review.shipCustom") }}
                        value={field.value}
                        onValueChange={applyPreset}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {presets.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                          <SelectItem value={CUSTOM}>{t("review.shipCustom")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              {text("shipToClinicName", t("review.shipToClinicName"))}
              <div className="grid gap-4 sm:grid-cols-2">
                {text("country", t("profile.country"), { placeholder: "CO", maxLength: 2 })}
                {text("stateProvince", t("profile.stateProvince"))}
                {text("city", t("profile.city"))}
                {text("postalCode", t("profile.postalCode"))}
              </div>
              {text("line1", t("profile.line1"))}
              {text("line2", t("profile.line2"))}
              {text("reference", t("profile.reference"))}
              <FormField
                control={form.control}
                name="shippingInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("review.shippingInstructions")}</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("review.agreementTitle")}</h3>
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">{agreementText}</p>
              <FormField
                control={form.control}
                name="agreementAccepted"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4"
                        checked={field.value === true}
                        onChange={(e) => field.onChange(e.target.checked ? true : undefined)}
                      />
                      <span>{t("review.agreementCheckbox")}</span>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("app.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("app.loading") : t("review.approve")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
