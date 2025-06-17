import { db } from "../firebase/client";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query, // 追加
  orderBy, // 追加
  writeBatch, // 追加
  serverTimestamp // 追加
} from "firebase/firestore";
import { User } from "firebase/auth";

/**
 * Memo型
 */
export type Memo = {
  id: string;
  content: string;
  createdAt: any; // serverTimestamp() を使うため any または Timestamp
  updatedAt: any; // serverTimestamp() を使うため any または Timestamp
  view: "general" | "yearly" | "monthly" | "daily";
  date: string;
  type?: "text" | "checklist";
  checked?: boolean;
};

/**
 * CustomCommand型
 */
export type CustomCommand = {
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * 4桁ゼロ埋めIDを生成
 */
function pad4(num: number): string {
  return num.toString().padStart(4, "0");
}

/**
 * /command add <コマンド名> "<コマンド内容>"
 */
export async function addCustomCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/command add ([a-zA-Z0-9_\-]+) "([\s\S]+)"$/);
  if (!match) return { error: '例: /command add greet "echo Hello"' };
  const [, name, content] = match;

  const ref = doc(db, "users", user.uid, "commands", name);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { error: `コマンド「${name}」はすでに存在します` };
  }

  const now = Date.now();
  await setDoc(ref, {
    name,
    content,
    createdAt: now,
    updatedAt: now
  } as CustomCommand);

  return { message: `自作コマンド「${name}」を追加しました` };
}

/**
 * /command edit <コマンド名> "<新しいコマンド内容>"
 */
export async function editCustomCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/command edit ([a-zA-Z0-9_\-]+) "([\s\S]+)"$/);
  if (!match) return { error: '例: /command edit greet "echo Hi"' };
  const [, name, content] = match;

  const ref = doc(db, "users", user.uid, "commands", name);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { error: `コマンド「${name}」は存在しません` };
  }

  await updateDoc(ref, {
    content,
    updatedAt: Date.now()
  });

  return { message: `自作コマンド「${name}」を編集しました` };
}

/**
 * /command delete <コマンド名>
 */
export async function deleteCustomCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/command delete ([a-zA-Z0-9_\-]+)$/);
  if (!match) {
    return { error: '例: /command delete my_command' };
  }
  const [, name] = match;

  const ref = doc(db, "users", user.uid, "commands", name);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { error: `コマンド「${name}」は存在しません` };
  }

  await deleteDoc(ref);
  return { message: `自作コマンド「${name}」を削除しました` };
}

/**
 * /command list
 */
export async function listCustomCommands(
  user: User
): Promise<{ message?: string; error?: string; commands?: string[] }> {
  const commandsCol = collection(db, "users", user.uid, "commands");
  const snap = await getDocs(commandsCol);
  if (snap.empty) {
    return { message: "自作コマンドはありません。" };
  }
  const commandNames = snap.docs.map(d => d.id);
  return { commands: commandNames };
}

/**
 * /command show <コマンド名>
 */
export async function showCustomCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string; content?: string }> {
  const match = cmd.match(/^\/command show ([a-zA-Z0-9_\-]+)$/);
  if (!match) {
    return { error: '例: /command show my_command' };
  }
  const [, name] = match;
  const ref = doc(db, "users", user.uid, "commands", name);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { error: `コマンド「${name}」は存在しません` };
  }
  const commandData = snap.data() as CustomCommand;
  return { content: commandData.content };
}

/**
 * /create add [checklist] "<内容>"
 */
async function addMemoCommand(
  user: User,
  cmd: string,
  view: Memo["view"],
  date: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/create add( checklist)? "([\s\S]+)"$/);
  if (!match) {
    return { error: '例: /create add "牛乳を買う" または /create add checklist "掃除をする"' };
  }
  const [, checklistFlag, content] = match;
  const type = checklistFlag ? "checklist" : "text";

  // ID生成ロジックについて:
  // 現在の方法 (memosSnap.size + 1) は、削除によるID振り直しや同時書き込みで問題が発生する可能性があります。
  // Firestoreのカウンタードキュメントや、より堅牢なID生成方法への変更を強く推奨します。
  // ここでは、削除時のID振り直しを考慮し、一時的にこのロジックを維持しますが、根本的な見直しが必要です。
  const memosSnap = await getDocs(collection(db, "users", user.uid, "memos"));
  const memoCount = memosSnap.size;
  // 注意: deleteMemoCommandでIDを振り直す場合、このID生成方法は衝突や予期せぬ動作の原因になります。
  // 本来はカウンタードキュメント等で一意な連番を管理すべきです。
  const nextId = pad4(memoCount + 1);


  try {
    // Firestoreに書き込むオブジェクト。idはsetDocの第2引数で指定するため、データオブジェクトからは除外。
    const dataToSet: Omit<Memo, "id"> = {
      content,
      createdAt: serverTimestamp(), // serverTimestamp() を使用
      updatedAt: serverTimestamp(), // serverTimestamp() を使用
      view,
      date,
      type,
    };

    if (type === "checklist") {
      dataToSet.checked = false;
    }
    // text型の場合、checkedフィールドは含めない (undefinedを避ける)

    await setDoc(doc(db, "users", user.uid, "memos", nextId), dataToSet);
    return { message: `メモを追加しました（ID: ${nextId}）` };
  } catch (e: any) {
    return { error: `メモの追加に失敗しました: ${e.message}` };
  }
}

/**
 * /create edit <メモID> "<新しい内容>"
 */
async function editMemoCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/create edit (\d{4}) "([\s\S]+)"$/);
  if (!match) return { error: '例: /create edit 0001 "新しい内容"' };
  const [, id, content] = match;

  const ref = doc(db, "users", user.uid, "memos", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { error: `ID: ${id} のメモが見つかりません` };

  await updateDoc(ref, {
    content,
    updatedAt: Date.now(),
  });

  return { message: `メモ（ID: ${id}）を編集しました` };
}

/**
 * /create delete <メモID>
 * メモを削除し、残りのメモのIDを連番に振り直します。
 * !!! 注意: この処理はメモの数が多い場合に非常に高コストであり、Firestoreのアンチパターンです。!!!
 *       IDは不変にすることを強く推奨します。
 *       また、createdAtがserverTimestampで正しく記録されていることが前提となります。
 */
async function deleteMemoCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/create delete (\d{4})$/);
  if (!match) return { error: '例: /create delete 0001' };
  const idToDelete = match[1];

  const memosCollectionRef = collection(db, "users", user.uid, "memos");
  const docToDeleteRef = doc(memosCollectionRef, idToDelete);

  try {
    const docToDeleteSnap = await getDoc(docToDeleteRef);
    if (!docToDeleteSnap.exists()) {
      return { error: `ID: ${idToDelete} のメモが見つかりません` };
    }

    // 1. 対象のドキュメントを削除
    await deleteDoc(docToDeleteRef);

    // 2. 残りの全メモを取得し、createdAtでソート (昇順)
    const q = query(memosCollectionRef, orderBy("createdAt"));
    const remainingMemosSnap = await getDocs(q);

    const batch = writeBatch(db);
    let newNumericId = 1;

    // 3. 取得した残りのメモのデータを一時的に保持
    const memosDataToRecreate: Array<Omit<Memo, "id">> = [];
    for (const docSnap of remainingMemosSnap.docs) {
      // まず、現在の(古いIDの)ドキュメントをバッチで削除
      batch.delete(doc(memosCollectionRef, docSnap.id));
      // 再作成用のデータを保持
      const data = docSnap.data() as Omit<Memo, "id">; // idは新しいものを振るため不要
      memosDataToRecreate.push(data);
    }

    // 4. 保持したデータを新しいIDでバッチ作成
    for (const memoData of memosDataToRecreate) {
      const newPaddedId = pad4(newNumericId);
      const dataForNewDoc = {
        ...memoData,
        updatedAt: serverTimestamp() // ID振り直し時にもupdatedAtを更新
      };
      // text型の場合、checkedフィールドが存在すれば削除
      if (dataForNewDoc.type === "text" && dataForNewDoc.hasOwnProperty('checked')) {
        delete dataForNewDoc.checked;
      } else if (dataForNewDoc.type === "checklist" && typeof dataForNewDoc.checked === 'undefined') {
        // checklist型でcheckedがない場合はfalseを設定
        dataForNewDoc.checked = false;
      }
      batch.set(doc(memosCollectionRef, newPaddedId), dataForNewDoc);
      newNumericId++;
    }

    await batch.commit();

    return { message: `メモ（旧ID: ${idToDelete}）を削除し、IDを再割り当てしました。` };
  } catch (e: any) {
    return { error: `メモの削除に失敗しました: ${e.message}` };
  }
}

/**
 * /create checklist <メモID>
 * チェック状態をトグル
 */
async function toggleChecklistCommand(
  user: User,
  cmd: string
): Promise<{ message?: string; error?: string }> {
  const match = cmd.match(/^\/create checklist (\d{4})$/);
  if (!match) return { error: '例: /create checklist 0002' };
  const [, id] = match;

  const ref = doc(db, "users", user.uid, "memos", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { error: `ID: ${id} のメモが見つかりません` };
  const memo = snap.data() as Memo;
  if (memo.type !== "checklist") return { error: "このメモはチェックリスト型ではありません" };

  await updateDoc(ref, {
    checked: !memo.checked,
    updatedAt: Date.now(),
  });

  return { message: `チェック状態を${!memo.checked ? "ON" : "OFF"}にしました（ID: ${id}）` };
}

/**
 * コマンドを実行するメイン関数
 */
export async function executeCommand(
  cmd: string,
  user: User,
  view: Memo["view"],
  date: string
): Promise<{ message?: string; error?: string }> {
  if (cmd.startsWith("/command add")) {
    return addCustomCommand(user, cmd);
  } else if (cmd.startsWith("/command edit")) {
    return editCustomCommand(user, cmd);
  } else if (cmd.startsWith("/command delete")) {
    return deleteCustomCommand(user, cmd);
  } else if (cmd.startsWith("/command list")) {
    const result = await listCustomCommands(user);
    if (result.error) return { error: result.error };
    if (result.commands && result.commands.length > 0) {
      return { message: "自作コマンド一覧:\n" + result.commands.join("\n") };
    }
    return { message: result.message || "自作コマンドはありません。" };
  } else if (cmd.startsWith("/command show")) {
    const result = await showCustomCommand(user, cmd);
    if (result.error) return { error: result.error };
    if (result.content) return { message: `コマンド「${cmd.split(" ")[2]}」の内容:\n${result.content}` };
    return { error: "コマンド内容の取得に失敗しました。" };
  } else if (cmd.startsWith("/create add")) {
    return addMemoCommand(user, cmd, view, date);
  } else if (cmd.startsWith("/create edit")) {
    return editMemoCommand(user, cmd);
  } else if (cmd.startsWith("/create delete")) {
    return deleteMemoCommand(user, cmd);
  } else if (cmd.startsWith("/create checklist")) {
    return toggleChecklistCommand(user, cmd);
  } else {
    return { error: `不明なコマンド、またはコマンドの形式が正しくありません: ${cmd}` };
  }
}