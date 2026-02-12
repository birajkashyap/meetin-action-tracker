import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meeting Action Items Tracker",
  description: "AI-powered meeting transcript analyzer — extract and manage action items automatically",
};

import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AnimatedBackground />
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navigation />
              <main style={{ flex: 1, position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '100px 24px 64px', width: '100%' }}>
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
