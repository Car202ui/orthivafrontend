"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ClinicForm } from "@/components/forms/clinic-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, type Clinic, type ClinicInput } from "@/lib/api";
import { useApi } from "@/lib/query";

const KEY = ["clinics"] as const;

export default function ClinicsPage() {
  const t = useTranslations();
  const call = useApi();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Clinic | null | "new">(null);
  const [deleting, setDeleting] = useState<Clinic | null>(null);

  const clinics = useQuery({ queryKey: KEY, queryFn: () => call<Clinic[]>("/api/clinics") });
  const onError = (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message);
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const save = useMutation({
    mutationFn: (input: ClinicInput) =>
      editing === "new" || !editing
        ? call<Clinic>("/api/clinics", { method: "POST", body: JSON.stringify(input) })
        : call<Clinic>(`/api/clinics/${editing.id}`, { method: "PUT", body: JSON.stringify(input) }),
    onSuccess: () => {
      toast.success(editing === "new" ? t("clinics.created") : t("clinics.updated"));
      setEditing(null);
      refresh();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => call<void>(`/api/clinics/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("clinics.deleted"));
      setDeleting(null);
      refresh();
    },
    onError,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("clinics.title")}</h1>
          <p className="text-muted-foreground">{t("clinics.subtitle")}</p>
        </div>
        <Button onClick={() => setEditing("new")}>{t("clinics.new")}</Button>
      </div>

      {clinics.data?.length === 0 && <p className="text-muted-foreground">{t("clinics.empty")}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinics.data?.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
              <CardDescription>
                {c.address ? `${c.address.line1}, ${c.address.city} (${c.address.country})` : "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {c.phoneCountry} {c.phoneNumber}
              </span>
              <span className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                  {t("clinics.edit")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(c)}>
                  {t("clinics.delete")}
                </Button>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? t("clinics.new") : t("clinics.edit")}</DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <ClinicForm
              key={editing === "new" ? "new" : editing.id}
              initial={editing === "new" ? null : editing}
              onSubmit={(input) => save.mutate(input)}
              onCancel={() => setEditing(null)}
              pending={save.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("clinics.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("clinics.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)}>
              {t("clinics.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
