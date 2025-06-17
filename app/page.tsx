import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 text-center mb-2">
          como<br  />
          コマンドメモアプリ
          <span className="block text-base font-normal text-gray-500 mt-1">（簡易デモ版）</span>
        </h1>
        <p className="text-gray-700 text-center leading-relaxed">
          このサイトは、<span className="font-semibold text-blue-600">キーボードだけで直感的に操作できる</span>
          <br className="hidden md:inline" />
          メモ・タスク管理アプリのデモです。<br />
          <span className="text-sm text-gray-500">
            メモページでは、画面下部のコマンド入力欄にコマンドを入力して操作できます。
          </span>
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link href="/memo">
            <button className="w-48 py-3 px-4 rounded-lg bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition">
              メモページへ
            </button>
          </Link>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              ログイン・新規登録ページ
            </Link>
            <Link href="/howto" className="text-blue-600 hover:underline">
              操作方法ページ
            </Link>
          </div>
        </div>
        <footer className="pt-4 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} キーボード特化メモ・タスク管理デモ
        </footer>
      </div>
    </main>
  );
}