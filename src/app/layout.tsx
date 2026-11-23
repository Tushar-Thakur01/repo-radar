import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";

export const metadata: Metadata = {
  title: "RepoRadar — GitHub Intelligence & AI Exploration",
  description:
    "Discover what's trending. Understand why. Explore open source with AI and MCP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
