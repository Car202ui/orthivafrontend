"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PatientForm, useCreatePatient, usePatients, type PatientInput } from "@/features/patients";
import { useApiErrorToast } from "@/shared/api/errors";
import { Link, useRouter } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

export default function PatientsPage() {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const patients = usePatients(debounced);
  const create = useCreatePatient();

  const submit = (input: PatientInput) =>
    create.mutate(input, {
      onSuccess: (p) => {
        toast.success(t("patients.created"));
        setCreating(false);
        router.push(`/doctor/patients/${p.id}`);
      },
      onError,
    });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("patients.title")}</h1>
          <p className="text-muted-foreground">{t("patients.subtitle")}</p>
        </div>
        <Button onClick={() => setCreating(true)}>{t("patients.new")}</Button>
      </div>

      <Input placeholder={t("patients.search")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("patients.name")}</TableHead>
            <TableHead>{t("patients.document")}</TableHead>
            <TableHead>{t("patients.email")}</TableHead>
            <TableHead>{t("patients.phone")}</TableHead>
            <TableHead>{t("patients.access")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {t("patients.empty")}
              </TableCell>
            </TableRow>
          )}
          {patients.data?.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">
                <Link href={`/doctor/patients/${p.id}`} className="hover:underline">
                  {p.lastName}, {p.firstName}
                </Link>
              </TableCell>
              <TableCell>{p.documentId ?? "—"}</TableCell>
              <TableCell>{p.email ?? "—"}</TableCell>
              <TableCell>{p.phoneNumber ? `${p.phoneCountry ?? ""} ${p.phoneNumber}` : "—"}</TableCell>
              <TableCell>
                <Badge variant={p.hasLogin ? "default" : "secondary"}>
                  {p.hasLogin ? t("patients.hasLogin") : t("patients.noLogin")}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("patients.new")}</DialogTitle>
          </DialogHeader>
          <PatientForm onSubmit={submit} onCancel={() => setCreating(false)} pending={create.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
