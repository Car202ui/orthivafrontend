"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { Patient, PatientInput } from "../types";

export function PatientForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Patient | null;
  onSubmit: (input: PatientInput) => void;
  onCancel: () => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const required = t("validation.required");
  const schema = z.object({
    firstName: z.string().trim().min(1, required).max(80),
    lastName: z.string().trim().min(1, required).max(80),
    email: z.string().trim().email(t("validation.email")).max(160).optional().or(z.literal("")),
    documentId: z.string().trim().max(30).optional().or(z.literal("")),
    birthDate: z.string().optional().or(z.literal("")),
    gender: z.enum(["F", "M", "X", ""]).optional(),
    phoneCountry: z.string().trim().max(6).optional().or(z.literal("")),
    phoneNumber: z.string().trim().max(20).optional().or(z.literal("")),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      email: initial?.email ?? "",
      documentId: initial?.documentId ?? "",
      birthDate: initial?.birthDate ?? "",
      gender: initial?.gender ?? "",
      phoneCountry: initial?.phoneCountry ?? "",
      phoneNumber: initial?.phoneNumber ?? "",
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
            firstName: v.firstName,
            lastName: v.lastName,
            email: v.email || undefined,
            documentId: v.documentId || undefined,
            birthDate: v.birthDate || null,
            gender: v.gender ? v.gender : null,
            phoneCountry: v.phoneCountry || undefined,
            phoneNumber: v.phoneNumber || undefined,
          }),
        )}
        className="space-y-4"
      >
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
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("patients.email")}</FormLabel>
              <FormControl>
                <Input type="email" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>{t("patients.emailHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
          {text("phoneCountry", t("profile.phoneCountry"), { placeholder: "+57" })}
          {text("phoneNumber", t("patients.phone"))}
        </div>
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
