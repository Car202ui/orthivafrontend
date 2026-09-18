"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { STAFF_TYPES, useCreateStaff, useMe, useStaff, type PersonType } from "@/features/identity";
import { useApiErrorToast } from "@/shared/api/errors";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export default function AdminUsersPage() {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const me = useMe();
  const isAdmin = !!me.data?.roles.includes("ADMIN");
  const users = useStaff(isAdmin);
  const create = useCreateStaff();
  const [open, setOpen] = useState(false);

  const schema = z.object({
    email: z.string().trim().email(t("validation.email")),
    firstName: z.string().trim().min(1, t("validation.required")).max(80),
    lastName: z.string().trim().min(1, t("validation.required")).max(80),
    type: z.enum(STAFF_TYPES as [PersonType, ...PersonType[]]),
    temporaryPassword: z.string().min(8, t("validation.minLength", { min: 8 })).max(64),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", firstName: "", lastName: "", type: "LAB", temporaryPassword: "" },
  });

  const submit = (values: Values) =>
    create.mutate(values, {
      onSuccess: () => {
        toast.success(t("adminUsers.created"));
        form.reset();
        setOpen(false);
      },
      onError,
    });

  if (!isAdmin) return <p className="text-destructive">{t("errors.forbidden")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("adminUsers.title")}</h1>
          <p className="text-muted-foreground">{t("adminUsers.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>{t("adminUsers.new")}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("adminUsers.new")}</DialogTitle>
              <DialogDescription>{t("adminUsers.subtitle")}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminUsers.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.firstName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("profile.lastName")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminUsers.role")}</FormLabel>
                      <Select items={Object.fromEntries(STAFF_TYPES.map((type) => [type, t(`roles.${type}`)]))} value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAFF_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`roles.${type}`)}
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
                  name="temporaryPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminUsers.temporaryPassword")}</FormLabel>
                      <FormControl>
                        <Input type="text" autoComplete="off" {...field} />
                      </FormControl>
                      <FormDescription>{t("adminUsers.temporaryPasswordHint")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {t("app.cancel")}
                  </Button>
                  <Button type="submit" disabled={create.isPending}>
                    {create.isPending ? t("app.loading") : t("app.create")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("adminUsers.name")}</TableHead>
            <TableHead>{t("adminUsers.email")}</TableHead>
            <TableHead>{t("adminUsers.role")}</TableHead>
            <TableHead>{t("adminUsers.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                {t("adminUsers.empty")}
              </TableCell>
            </TableRow>
          )}
          {users.data?.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">
                {u.firstName} {u.lastName}
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{t(`roles.${u.type}`)}</TableCell>
              <TableCell>
                <Badge variant={u.active ? "default" : "secondary"}>{u.active ? t("adminUsers.active") : t("adminUsers.inactive")}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
