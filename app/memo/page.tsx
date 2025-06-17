"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Memo } from "../../types";
import CommandInput from "../../components/CommandInput";
import MemoView from "../../components/MemoView";
import { executeCommand } from "../../utils/commands";

export default function MemoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [view] = useState<"general" | "yearly" | "monthly" | "daily">("general");
  const [date] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Firebase認証監視
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) router.replace("/login");
      else setUser(u);
    });
    return unsub;
  }, [router]);

  // メモ監視
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "memos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      // Firestoreから取得するデータに type と checked が含まれるようにする
      const fetchedMemos = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          content: data.content,
          createdAt: data.createdAt, // Timestampオブジェクトのままか、必要なら .toMillis() など
          updatedAt: data.updatedAt,
          view: data.view,
          date: data.date,
          type: data.type,
          checked: data.checked,
        } as Memo;
      });
      setMemos(fetchedMemos);
    });
    return unsub;
  }, [user]);

  // コマンド実行
  const handleCommand = async (cmd: string) => {
    if (!user) return;
    const res = await executeCommand(cmd, user, view, date);
    if (res.message) setMessage(res.message);
    if (res.error) setMessage(res.error);
    setTimeout(() => setMessage(null), 3000); // メッセージ表示時間を少し延長
  };

  const handleToggleCheck = async (memoId: string) => {
    if (!user) return;
    // `/create checklist <memoId>` コマンドを生成して実行
    const commandToExecute = `/create checklist ${memoId}`;
    await handleCommand(commandToExecute);
  };

  return (
    <div className="container">
      <h2>メモ一覧（{view}）</h2>
      <MemoView
        memos={memos.filter(m => m.view === view)}
        onToggleCheck={handleToggleCheck} // コールバックを渡す
      />
      {message && (
        <div
          className="mt-1" // globals.css のユーティリティクラスを使用
          style={{ color: message.startsWith("エラー") ? "red" : "green" }}
        >
          {message}
        </div>
      )}
      <CommandInput onCommand={handleCommand} />
    </div>
  );
}