"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { Plan } from "../types";

/**
 * Thread of a plan version. When `onPost` is given the viewer may write; `postLabel`
 * tells them what their message means (a change request for the doctor, a reply for the lab).
 */
export function PlanComments({
  plan,
  onPost,
  postLabel,
  pending,
}: {
  plan: Plan;
  onPost?: (body: string) => void;
  postLabel?: string;
  pending?: boolean;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const [body, setBody] = useState("");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("review.comments")}</h3>
      {plan.comments.length === 0 && <p className="text-sm text-muted-foreground">{t("review.noComments")}</p>}
      <ul className="space-y-2">
        {plan.comments.map((c) => (
          <li key={c.id} className="rounded-md border p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">
              {c.authorName ?? "—"} · {format.dateTime(new Date(c.createdAt), { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </li>
        ))}
      </ul>
      {onPost && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            onPost(body.trim());
            setBody("");
          }}
        >
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={4000} placeholder={t("review.commentPlaceholder")} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="outline" disabled={pending || !body.trim()}>
              {postLabel ?? t("review.postComment")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
