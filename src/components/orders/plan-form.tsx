"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Plan, PlanInput } from "@/lib/api";

const num = z
  .string()
  .regex(/^\d*([.,]\d+)?$/, "0-9")
  .optional()
  .or(z.literal(""));
const toNum = (v?: string) => (v ? Number(v.replace(",", ".")) : null);

export function PlanForm({
  plan,
  onSubmit,
  pending,
}: {
  plan: Plan;
  onSubmit: (input: PlanInput) => void;
  pending?: boolean;
}) {
  const t = useTranslations();
  const schema = z.object({
    diagnosis: z.string().max(8000).optional().or(z.literal("")),
    additionalInfo: z.string().max(8000).optional().or(z.literal("")),
    upperStages: z.string().regex(/^\d*$/).optional().or(z.literal("")),
    lowerStages: z.string().regex(/^\d*$/).optional().or(z.literal("")),
    priceUpper: num,
    priceLower: num,
    stages: z.array(
      z.object({
        stageNumber: z.string().regex(/^\d+$/, "1+"),
        arch: z.enum(["UPPER", "LOWER"]),
        description: z.string().max(2000).optional().or(z.literal("")),
        cost: num,
      }),
    ),
  });
  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      diagnosis: plan.diagnosis ?? "",
      additionalInfo: plan.additionalInfo ?? "",
      upperStages: plan.upperStages?.toString() ?? "",
      lowerStages: plan.lowerStages?.toString() ?? "",
      priceUpper: plan.priceUpper?.toString() ?? "",
      priceLower: plan.priceLower?.toString() ?? "",
      stages: plan.stages.map((s) => ({
        stageNumber: String(s.stageNumber),
        arch: s.arch,
        description: s.description ?? "",
        cost: s.cost?.toString() ?? "",
      })),
    },
  });
  const stages = useFieldArray({ control: form.control, name: "stages" });

  const submit = (v: Values) =>
    onSubmit({
      diagnosis: v.diagnosis || undefined,
      additionalInfo: v.additionalInfo || undefined,
      upperStages: v.upperStages ? Number(v.upperStages) : null,
      lowerStages: v.lowerStages ? Number(v.lowerStages) : null,
      priceUpper: toNum(v.priceUpper),
      priceLower: toNum(v.priceLower),
      priceTotal: null, // computed server-side as upper + lower
      stages: v.stages.map((s) => ({
        stageNumber: Number(s.stageNumber),
        arch: s.arch,
        description: s.description || null,
        cost: toNum(s.cost),
      })),
    });

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("lab.diagnosis")}</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {text("upperStages", t("lab.upperStages"), { inputMode: "numeric" })}
          {text("lowerStages", t("lab.lowerStages"), { inputMode: "numeric" })}
          {text("priceUpper", `${t("lab.priceUpper")} (${plan.currency})`, { inputMode: "decimal" })}
          {text("priceLower", `${t("lab.priceLower")} (${plan.currency})`, { inputMode: "decimal" })}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("lab.stages")}</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => stages.append({ stageNumber: String(stages.fields.length + 1), arch: "UPPER", description: "", cost: "" })}
            >
              {t("lab.addStage")}
            </Button>
          </div>
          {stages.fields.map((f, i) => (
            <div key={f.id} className="grid items-end gap-3 rounded-md border p-3 sm:grid-cols-[90px_140px_1fr_120px_auto]">
              <FormField
                control={form.control}
                name={`stages.${i}.stageNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t("lab.stageNumber")}</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`stages.${i}.arch`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t("lab.stageArch")}</FormLabel>
                    <Select items={{ UPPER: t("orders.form.archUPPER"), LOWER: t("orders.form.archLOWER") }} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UPPER">{t("orders.form.archUPPER")}</SelectItem>
                        <SelectItem value="LOWER">{t("orders.form.archLOWER")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`stages.${i}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t("lab.stageDescription")}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`stages.${i}.cost`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">{t("lab.stageCost")}</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" {...field} value={field.value ?? ""} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" size="sm" variant="ghost" onClick={() => stages.remove(i)}>
                {t("orders.form.remove")}
              </Button>
            </div>
          ))}
        </section>

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("lab.additionalInfo")}</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending}>
          {pending ? t("app.loading") : t("lab.savePlan")}
        </Button>
      </form>
    </Form>
  );
}
