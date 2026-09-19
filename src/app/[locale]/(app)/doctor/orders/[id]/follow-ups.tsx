"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { FollowUpForm, FollowUpList, useCreateFollowUp, useDeleteFollowUp, useFollowUps, useUpdateFollowUp, type FollowUp } from "@/features/followups";
import { useCloseOrder, type Order } from "@/features/orders";
import { useApiErrorToast } from "@/shared/api/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

const IN_TREATMENT = ["SHIPPED", "IN_FOLLOW_UP"];

/** Doctor's check-ups of a shipped order, plus the "close treatment" action. */
export function FollowUps({ order, isDoctor }: { order: Order; isDoctor: boolean }) {
  const t = useTranslations();
  const onError = useApiErrorToast();
  const followUps = useFollowUps(order.id);
  const create = useCreateFollowUp(order.id);
  const update = useUpdateFollowUp(order.id);
  const remove = useDeleteFollowUp(order.id);
  const close = useCloseOrder(order.id);
  const [dialog, setDialog] = useState<"new" | FollowUp | null>(null);
  const [deleting, setDeleting] = useState<FollowUp | null>(null);
  const [closing, setClosing] = useState(false);

  const editable = isDoctor && IN_TREATMENT.includes(order.status);
  const list = followUps.data ?? [];
  const nextMonth = list.length ? Math.max(...list.map((f) => f.treatmentMonth)) + 1 : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          {t("followUps.title")}
          {editable && (
            <span className="flex gap-2">
              {order.status === "IN_FOLLOW_UP" && (
                <Button size="sm" variant="outline" onClick={() => setClosing(true)}>
                  {t("followUps.close")}
                </Button>
              )}
              <Button size="sm" onClick={() => setDialog("new")}>
                {t("followUps.new")}
              </Button>
            </span>
          )}
        </CardTitle>
        <CardDescription>{isDoctor ? t("followUps.subtitle") : null}</CardDescription>
      </CardHeader>
      <CardContent>
        <FollowUpList followUps={list} editable={editable} onEdit={(f) => setDialog(f)} onDelete={setDeleting} />
      </CardContent>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "new" ? t("followUps.new") : t("followUps.edit")}</DialogTitle>
          </DialogHeader>
          {dialog !== null && (
            <FollowUpForm
              key={dialog === "new" ? "new" : dialog.id}
              initial={dialog === "new" ? null : dialog}
              nextMonth={nextMonth}
              pending={create.isPending || update.isPending}
              onCancel={() => setDialog(null)}
              onSubmit={(input) => {
                const done = (msg: string) => () => {
                  toast.success(msg);
                  setDialog(null);
                };
                if (dialog === "new") create.mutate(input, { onSuccess: done(t("followUps.created")), onError });
                else update.mutate({ id: dialog.id, input }, { onSuccess: done(t("followUps.updated")), onError });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("followUps.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("followUps.deleteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleting &&
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.success(t("followUps.deleted"));
                    setDeleting(null);
                  },
                  onError,
                })
              }
            >
              {t("app.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={closing} onOpenChange={setClosing}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("followUps.closeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("followUps.closeBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                close.mutate(undefined, {
                  onSuccess: () => {
                    toast.success(t("followUps.closed"));
                    setClosing(false);
                  },
                  onError,
                })
              }
            >
              {t("followUps.close")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
