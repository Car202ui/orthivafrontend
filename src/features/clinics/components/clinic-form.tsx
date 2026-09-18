"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import type { Clinic, ClinicInput } from "../types";

export function ClinicForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Clinic | null;
  onSubmit: (input: ClinicInput) => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const required = t("validation.required");
  const schema = z.object({
    name: z.string().trim().min(1, required).max(120),
    website: z.string().trim().max(160).optional().or(z.literal("")),
    phoneCountry: z.string().trim().max(6).optional().or(z.literal("")),
    phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
    country: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, t("validation.country")),
    stateProvince: z.string().trim().max(80).optional().or(z.literal("")),
    city: z.string().trim().min(1, required).max(80),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),
    line1: z.string().trim().min(1, required).max(200),
    line2: z.string().trim().max(200).optional().or(z.literal("")),
    reference: z.string().trim().max(300).optional().or(z.literal("")),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      website: initial?.website ?? "",
      phoneCountry: initial?.phoneCountry ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
      country: initial?.address?.country ?? "",
      stateProvince: initial?.address?.stateProvince ?? "",
      city: initial?.address?.city ?? "",
      postalCode: initial?.address?.postalCode ?? "",
      line1: initial?.address?.line1 ?? "",
      line2: initial?.address?.line2 ?? "",
      reference: initial?.address?.reference ?? "",
    },
  });

  const text = (name: keyof Values, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...props} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          onSubmit({
            name: v.name,
            website: v.website || undefined,
            phoneCountry: v.phoneCountry || undefined,
            phoneNumber: v.phoneNumber || undefined,
            address: {
              country: v.country.toUpperCase(),
              stateProvince: v.stateProvince || null,
              city: v.city,
              postalCode: v.postalCode || null,
              line1: v.line1,
              line2: v.line2 || null,
              reference: v.reference || null,
            },
          }),
        )}
        className="space-y-4"
      >
        {text("name", t("clinics.name"))}
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          {text("phoneCountry", t("profile.phoneCountry"), { placeholder: "+57" })}
          {text("phoneNumber", t("clinics.phone"))}
        </div>
        {text("website", t("clinics.website"), { placeholder: "https://" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {text("country", t("profile.country"), { placeholder: "CO", maxLength: 2 })}
          {text("stateProvince", t("profile.stateProvince"))}
          {text("city", t("profile.city"))}
          {text("postalCode", t("profile.postalCode"))}
        </div>
        {text("line1", t("profile.line1"))}
        {text("line2", t("profile.line2"))}
        {text("reference", t("profile.reference"))}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("app.cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? t("app.loading") : t("app.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
