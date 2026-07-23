import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { GoogleTranslateProvider } from "@/components/providers/google-translate-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Usapho lakwaMsimanga — The Msimanga Family Archive",
    template: "%s · Msimanga",
  },
  description:
    "A dedicated archive for the Msimanga family — our family tree, our people, our places, and the izithakazelo carried down through the generations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleTranslateProvider>
            <QueryProvider>
              <TooltipProvider delay={200}>
                {children}
                <Toaster richColors position="top-center" />
              </TooltipProvider>
            </QueryProvider>
          </GoogleTranslateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
