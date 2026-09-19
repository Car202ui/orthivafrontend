"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { FollowUp, FollowUpInput } from "../types";

export function FollowUpForm({
  initial,
  nextMonth,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: FollowUp | null;
  /** Suggested treatment month for a new check-up (last one + 1). */
  nextMonth: number;
  onSubmit: (input: FollowUpInput) => void;
  onCancel?: () => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const schema = z.object({
    visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("validation.required")),
    treatmentMonth: z.coerce.number().int().min(1, t("validation.minValue", { min: 1 })).max(60),
    notes: z.string().trim().max(8000).optional().or(z.literal("")),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      visitDate: initial?.visitDate ?? new Date().toISOString().slice(0, 10),
      treatmentMonth: initial?.treatmentMonth ?? nextMonth,
      notes: initial?.notes ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => onSubmit({ visitDate: v.visitDate, treatmentMonth: v.treatmentMonth, notes: v.notes || undefined }))}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("followUps.visitDate")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="treatmentMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("followUps.treatmentMonth")}</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={60} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("followUps.notes")}</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("app.cancel")}
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? t("app.loading") : t("app.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
