"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { Person, PersonType, ProfileInput } from "../types";

const country = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/);

function buildSchema(type: PersonType, t: (k: string, v?: Record<string, string | number>) => string) {
  const required = t("validation.required");
  const base = z.object({
    firstName: z.string().trim().min(1, required).max(80),
    lastName: z.string().trim().min(1, required).max(80),
    phoneCountry: z.string().trim().max(6).optional().or(z.literal("")),
    phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
    locale: z.enum(["es", "en"]),
    gender: z.enum(["F", "M", "X", ""]).optional(),
    documentId: z.string().trim().max(30).optional().or(z.literal("")),
    birthDate: z.string().optional().or(z.literal("")),
    specialty: z.string().trim().max(80).optional().or(z.literal("")),
    licenseNumber: z.string().trim().max(40).optional().or(z.literal("")),
    licenseCountry: z.string().trim().optional().or(z.literal("")),
    addrCountry: z.string().trim().optional().or(z.literal("")),
    addrState: z.string().trim().max(80).optional().or(z.literal("")),
    addrCity: z.string().trim().max(80).optional().or(z.literal("")),
    addrPostal: z.string().trim().max(20).optional().or(z.literal("")),
    addrLine1: z.string().trim().max(200).optional().or(z.literal("")),
    addrLine2: z.string().trim().max(200).optional().or(z.literal("")),
  });
  if (type !== "DOCTOR") return base;
  return base.extend({
    licenseNumber: z.string().trim().min(1, required).max(40),
    licenseCountry: country.refine(() => true, t("validation.country")),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

function toInput(v: FormValues, locale: string): ProfileInput {
  const hasAddress = v.addrCountry && v.addrCity && v.addrLine1;
  return {
    firstName: v.firstName,
    lastName: v.lastName,
    phoneCountry: v.phoneCountry || undefined,
    phoneNumber: v.phoneNumber || undefined,
    locale,
    gender: v.gender ? v.gender : null,
    documentId: v.documentId || undefined,
    birthDate: v.birthDate || null,
    specialty: v.specialty || undefined,
    licenseNumber: v.licenseNumber || undefined,
    licenseCountry: v.licenseCountry ? v.licenseCountry.toUpperCase() : undefined,
    address: hasAddress
      ? {
          country: v.addrCountry!.toUpperCase(),
          stateProvince: v.addrState || null,
          city: v.addrCity!,
          postalCode: v.addrPostal || null,
          line1: v.addrLine1!,
          line2: v.addrLine2 || null,
          reference: null,
        }
      : null,
  };
}

export function ProfileForm({
  type,
  initial,
  locale,
  submitLabel,
  onSubmit,
  pending,
}: {
  type: PersonType;
  initial?: Partial<Person> | null;
  locale: string;
  submitLabel: string;
  onSubmit: (input: ProfileInput) => Promise<void> | void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const schema = buildSchema(type, t as never);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName === "-" ? "" : (initial?.firstName ?? ""),
      lastName: initial?.lastName === "-" ? "" : (initial?.lastName ?? ""),
      phoneCountry: initial?.phoneCountry ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
      locale: (initial?.locale as "es" | "en") ?? (locale as "es" | "en"),
      gender: initial?.gender ?? "",
      documentId: initial?.documentId ?? "",
      birthDate: initial?.birthDate ?? "",
      specialty: initial?.specialty ?? "",
      licenseNumber: initial?.licenseNumber ?? "",
      licenseCountry: initial?.licenseCountry ?? "",
      addrCountry: initial?.address?.country ?? "",
      addrState: initial?.address?.stateProvince ?? "",
      addrCity: initial?.address?.city ?? "",
      addrPostal: initial?.address?.postalCode ?? "",
      addrLine1: initial?.address?.line1 ?? "",
      addrLine2: initial?.address?.line2 ?? "",
    },
  });

  const text = (name: keyof FormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(toInput(v, v.locale)))} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("profile.personal")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("firstName", t("profile.firstName"))}
            {text("lastName", t("profile.lastName"))}
            {text("documentId", t("profile.documentId"))}
            {text("birthDate", t("profile.birthDate"), { type: "date" })}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.gender")}</FormLabel>
                  <Select
                    items={{ F: t("profile.genderF"), M: t("profile.genderM"), X: t("profile.genderX") }}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="F">{t("profile.genderF")}</SelectItem>
                      <SelectItem value="M">{t("profile.genderM")}</SelectItem>
                      <SelectItem value="X">{t("profile.genderX")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("profile.locale")}</FormLabel>
                  <Select items={{ es: t("language.es"), en: t("language.en") }} value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="es">{t("language.es")}</SelectItem>
                      <SelectItem value="en">{t("language.en")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("profile.contact")}</h2>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            {text("phoneCountry", t("profile.phoneCountry"), { placeholder: "+57" })}
            {text("phoneNumber", t("profile.phoneNumber"))}
          </div>
        </section>

        {type === "DOCTOR" && (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("profile.professional")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("specialty", t("profile.specialty"))}
              {text("licenseNumber", t("profile.licenseNumber"))}
              {text("licenseCountry", t("profile.licenseCountry"), { placeholder: "CO", maxLength: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">{t("profile.licenseHint")}</p>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("profile.address")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {text("addrCountry", t("profile.country"), { placeholder: "CO", maxLength: 2 })}
            {text("addrState", t("profile.stateProvince"))}
            {text("addrCity", t("profile.city"))}
            {text("addrPostal", t("profile.postalCode"))}
            {text("addrLine1", t("profile.line1"))}
            {text("addrLine2", t("profile.line2"))}
          </div>
        </section>

        <Button type="submit" disabled={pending}>
          {pending ? t("app.loading") : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
