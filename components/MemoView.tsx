import { Memo } from "../types";

type Props = {
  memos: Memo[];
  onToggleCheck?: (memoId: string) => void; // チェック状態変更のためのコールバック
};

export default function MemoView({ memos, onToggleCheck }: Props) {
  if (memos.length === 0) return <div className="no-memos">メモはありません</div>;

  const handleCheckboxChange = (memoId: string) => {
    if (onToggleCheck) {
      onToggleCheck(memoId);
    }
  };

  return (
    <ul className="memo-list">
      {memos.map(m => (
        <li key={m.id} className={m.type === "checklist" && m.checked ? "checked-item" : ""}>
          {m.type === "checklist" && onToggleCheck && (
            <input
              type="checkbox"
              checked={!!m.checked}
              onChange={() => handleCheckboxChange(m.id)}
              style={{ marginRight: '10px' }}
            />
          )}
          <span className="memo-id">{m.id.substring(0, 5)}...</span>
          <span className={`memo-content ${m.type === "checklist" && m.checked ? "strikethrough" : ""}`}>
            {m.content}
          </span>
        </li>
      ))}
    </ul>
  );
}