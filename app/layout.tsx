import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Interview Prep Platform",
  description: "Подготовка к техническим IT-собеседованиям по ролям, стеку и уровню.",
  icons: {
    icon: "/icon_ip.png",
    shortcut: "/icon_ip.png",
    apple: "/icon_ip.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
