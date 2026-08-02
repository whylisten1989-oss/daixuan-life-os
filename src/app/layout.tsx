import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./visual-rescue.css";

export const metadata: Metadata = {
  title: { default: "岱旋 Life OS", template: "%s · 岱旋 Life OS" },
  description: "个人生活管理与行动中枢",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#080c0b" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="noise-layer antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
