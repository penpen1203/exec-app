import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExecOS - やるべきこと実行支援アプリ",
  description: "目標管理、タスク自動チャンク化、習慣トラッカー、ジャーナル、ガミフィケーションを統合したオールインワンアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
