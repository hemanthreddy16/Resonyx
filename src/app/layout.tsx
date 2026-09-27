import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EnterpriseShell } from "@/components/layout/EnterpriseShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RESONYX | Organizational Failure Intelligence & Prevention",
  description:
    "Every Failure Becomes Intelligence. Resonyx remembers organizational failures using Hindsight, discovers recurring patterns from historical outcomes, and helps teams prevent similar failures in the future.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#060911] text-slate-100 font-sans`}
      >
        <EnterpriseShell>{children}</EnterpriseShell>
      </body>
    </html>
  );
}
