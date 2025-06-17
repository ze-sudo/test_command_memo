"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase/client";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) router.replace("/memo");
    });
    return unsub;
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      setMsg("ログイン成功");
    } catch (e: any) {
      setMsg(`エラー: ${e.message}`);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      setMsg("新規登録成功");
    } catch (e: any) {
      setMsg(`エラー: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMsg("ログアウトしました");
  };

  return (
    <div className="container">
      <h2>ログイン・新規登録</h2>
      {user ? (
        <div>
          <p>ログイン中: {user.email}</p>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
      ) : (
        <>
          <div>
            <input type="email" placeholder="メールアドレス"
              value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="パスワード"
              value={pw} onChange={e => setPw(e.target.value)} />
          </div>
          <button onClick={handleLogin} style={{ marginRight: 8 }}>ログイン</button>
          <button onClick={handleRegister}>新規登録</button>
        </>
      )}
      {msg && <div className="mt-1" style={{ color: msg.startsWith("エラー") ? "red" : "green" }}>{msg}</div>}
      <div className="mt-1">
        <Link href="/">トップへ戻る</Link>
      </div>
    </div>
  );
}