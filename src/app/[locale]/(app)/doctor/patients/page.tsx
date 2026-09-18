"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PatientForm } from "@/components/forms/patient-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, type Patient, type PatientInput } from "@/lib/api";
import { useApi } from "@/lib/query";

export default function PatientsPage() {
  const t = useTranslations();
  const call = useApi();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const patients = useQuery({
    queryKey: ["patients", debounced],
    queryFn: () => call<Patient[]>(`/api/patients${debounced ? `?q=${encodeURIComponent(debounced)}` : ""}`),
  });

  const create = useMutation({
    mutationFn: (input: PatientInput) => call<Patient>("/api/patients", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: (p) => {
      toast.success(t("patients.created"));
      setCreating(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      router.push(`/doctor/patients/${p.id}`);
    },
    onError: (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message),
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
          <PatientForm onSubmit={(input) => create.mutate(input)} onCancel={() => setCreating(false)} pending={create.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
