import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 正しいパスであることを確認してください
import Header from "../components/Header"; // Headerコンポーネントをインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "コマンドメモアプリ",
  description: "キーボード操作特化メモ＆タスク管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
