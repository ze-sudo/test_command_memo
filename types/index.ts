export type Memo = {
  id: string;
  content: string;
  createdAt: number;
  view: "general" | "yearly" | "monthly" | "daily";
  date?: string; // 例: 2025, 2025-06, 2025-06-17
  type?: "list" | "checklist";
  checked?: boolean;           // ← checklist用の状態
};