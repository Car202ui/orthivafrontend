"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) router.replace("/dashboard");
  }, [auth.isAuthenticated, router]);

  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Orthiva</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Planeación y gestión de alineadores dentales
          </p>
        </div>

        {auth.error && (
          <p className="text-sm text-destructive">Error de autenticación: {auth.error.message}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={auth.isLoading}
          onClick={() => auth.signinRedirect()}
        >
          {auth.isLoading ? "Cargando…" : "Ingresar"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Serás redirigido al inicio de sesión seguro (Keycloak).
        </p>
      </div>
    </main>
  );
}
