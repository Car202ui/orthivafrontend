"use client";

import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMockWebhook } from "@/features/payments";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * Stand-in for the provider's hosted checkout in development (MOCK gateway). Public page:
 * the tester approves or declines and is sent back to the app's return URL, exactly as
 * Wompi would do. Only works while the core has orthiva.payments.mock-enabled=true.
 */
export default function MockPayPage() {
  const t = useTranslations("payments.mock");
  const { reference } = useParams<{ reference: string }>();
  const params = useSearchParams();
  const returnUrl = params.get("return");
  const webhook = useMockWebhook();
  const [error, setError] = useState<string | null>(null);

  const decide = (status: "APPROVED" | "DECLINED") =>
    webhook.mutate(
      { reference, status },
      {
        onSuccess: () => {
          if (returnUrl) window.location.assign(returnUrl);
        },
        onError: (e) => setError(e.message),
      },
    );

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("title")}
            <Badge variant="secondary">MOCK</Badge>
          </CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("reference")}: <code>{reference}</code>
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={() => decide("APPROVED")} disabled={webhook.isPending}>
              {t("approve")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => decide("DECLINED")} disabled={webhook.isPending}>
              {t("decline")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
