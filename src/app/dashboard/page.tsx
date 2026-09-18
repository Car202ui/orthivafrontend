"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Me } from "@/lib/api";
import { rolesFromToken, useAuth } from "@/lib/auth";

/** Placeholder home: proves the login → token → core API round-trip. Real menus per role come in Phase 1. */
export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
      router.replace("/");
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, router]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    api<Me>("/api/me", auth.user?.access_token)
      .then(setMe)
      .catch((e: Error) => setApiError(e.message));
  }, [auth.isAuthenticated, auth.user?.access_token]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return <main className="flex flex-1 items-center justify-center text-muted-foreground">Cargando…</main>;
  }

  const roles = rolesFromToken(auth.user?.access_token);

  return (
    <main className="flex-1 bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Orthiva</h1>
          <Button variant="outline" onClick={() => auth.signoutRedirect()}>
            Cerrar sesión
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Sesión (Keycloak)</CardTitle>
            <CardDescription>Datos del token recibido en el navegador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Usuario:</span> {auth.user?.profile.preferred_username}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {auth.user?.profile.email}
            </p>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <Badge key={r} variant="secondary">
                  {r}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Core API — GET /api/me</CardTitle>
            <CardDescription>Respuesta del backend validando el mismo token</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {apiError && <p className="text-destructive">Error: {apiError}</p>}
            {me && (
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(me, null, 2)}</pre>
            )}
            {!me && !apiError && <p className="text-muted-foreground">Consultando…</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
