import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/shared/ui/sonner";
import { routing } from "@/shared/i18n/routing";
import { OrthivaAuthProvider } from "@/shared/auth/provider";
import { OrthivaQueryProvider } from "@/shared/query/provider";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orthiva",
  description: "Clear aligner planning and case management",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <OrthivaAuthProvider>
            <OrthivaQueryProvider>
              {children}
              <Toaster richColors position="top-right" />
            </OrthivaQueryProvider>
          </OrthivaAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
