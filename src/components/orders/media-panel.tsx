"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, PRESCRIPTION_KINDS, type Media, type MediaKind } from "@/lib/api";
import { useApi } from "@/lib/query";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Gallery + (optionally) uploader for an order's files. */
export function MediaPanel({ orderId, media, editable }: { orderId: string; media: Media[]; editable: boolean }) {
  const t = useTranslations();
  const call = useApi();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<MediaKind>("PHOTO_FRONTAL");
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["orders", "one", orderId] });
  const onError = (e: ApiError) => toast.error(e.code ? t(`errors.${e.code}`) : e.message);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return call<Media>(`/api/orders/${orderId}/media?kind=${kind}`, { method: "POST", body });
    },
    onSuccess: () => {
      toast.success(t("orders.media.uploaded"));
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (mediaId: string) => call<void>(`/api/orders/${orderId}/media/${mediaId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("orders.media.deleted"));
      refresh();
    },
    onError,
  });

  return (
    <div className="space-y-4">
      {editable && (
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px]">
              <label className="mb-1 block text-xs font-medium">{t("orders.media.kind")}</label>
              <Select
                items={Object.fromEntries(PRESCRIPTION_KINDS.flatMap((g) => g.kinds.map((k) => [k, t(`orders.kinds.${k}`)])))}
                value={kind}
                onValueChange={(v) => setKind((v ?? "PHOTO_FRONTAL") as MediaKind)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESCRIPTION_KINDS.map((g) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel>{t(`orders.media.${g.group}`)}</SelectLabel>
                      {g.kinds.map((k) => (
                        <SelectItem key={k} value={k}>
                          {t(`orders.kinds.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input ref={fileRef} type="file" className="text-sm" data-testid="media-file" />
            <Button
              type="button"
              disabled={upload.isPending}
              onClick={() => {
                const f = fileRef.current?.files?.[0];
                if (f) upload.mutate(f);
              }}
            >
              {upload.isPending ? t("orders.media.uploading") : t("orders.media.upload")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("orders.media.hint")}</p>
        </div>
      )}

      {media.length === 0 && <p className="text-sm text-muted-foreground">{t("orders.media.empty")}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-md border">
            <a href={m.url} target="_blank" rel="noreferrer" className="block bg-muted">
              {m.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.thumbnailUrl} alt={m.fileName} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {m.kind === "STL" ? "STL" : m.kind === "PDF" ? "PDF" : m.kind === "VIDEO" ? "▶" : "•"}
                </div>
              )}
            </a>
            <div className="space-y-1 p-2 text-xs">
              <p className="font-medium">{t(`orders.kinds.${m.kind}`)}</p>
              <p className="truncate text-muted-foreground" title={m.fileName}>
                {m.fileName} · {formatBytes(m.sizeBytes)}
                {m.widthPx ? ` · ${m.widthPx}×${m.heightPx}` : ""}
              </p>
              {editable && (
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => remove.mutate(m.id)}>
                  {t("orders.media.delete")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
