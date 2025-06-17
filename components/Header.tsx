import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-content container">
        <Link href="/" className="site-title">
          　como
        </Link>
        <nav>
          <Link href="/">トップ</Link>
          <Link href="/memo">メモ</Link>
          <Link href="/howto">使い方</Link>
          <Link href="/login">ログイン</Link>
        </nav>
      </div>
    </header>
  );
}