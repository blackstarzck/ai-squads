import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MuiProvider } from "@/components/MuiProvider";
import { Toaster } from "@/components/ui/sonner";

const freesentation = localFont({
  src: [
    { path: "../../public/fonts/Freesentation-1Thin.ttf", weight: "100" },
    { path: "../../public/fonts/Freesentation-2ExtraLight.ttf", weight: "200" },
    { path: "../../public/fonts/Freesentation-3Light.ttf", weight: "300" },
    { path: "../../public/fonts/Freesentation-4Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Freesentation-5Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Freesentation-6SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Freesentation-7Bold.ttf", weight: "700" },
    { path: "../../public/fonts/Freesentation-8ExtraBold.ttf", weight: "800" },
    { path: "../../public/fonts/Freesentation-9Black.ttf", weight: "900" },
  ],
  variable: "--font-freesentation",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI-Sync OpenDev",
  description: "Visual IDE for AI Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body className={`${freesentation.variable} font-sans h-full overflow-hidden bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MuiProvider>
            {children}
            <Toaster />
          </MuiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
