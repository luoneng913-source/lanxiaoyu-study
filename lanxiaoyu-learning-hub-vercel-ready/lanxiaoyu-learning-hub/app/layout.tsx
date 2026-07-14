import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "蓝筱玉整装学堂｜学习成长中心",
  description: "课程资料、学习路径、实战工具与模板的一站式学习成长中心。",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
