import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meeting Action Items Tracker",
  description: "Extract and manage action items from meeting transcripts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Meeting Action Items Tracker
            </h1>
            <nav className="mt-2 flex gap-4 text-sm">
              <a href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </a>
              <a href="/history" className="text-blue-600 hover:text-blue-800">
                History
              </a>
              <a href="/status" className="text-blue-600 hover:text-blue-800">
                Status
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
