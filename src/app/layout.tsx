import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Annuaire Communautaire",
  description: "Gestion des membres de la communauté",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body suppressHydrationWarning>
        <SessionProvider>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
