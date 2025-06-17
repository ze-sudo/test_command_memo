"use client";

import { useState } from "react";

type Props = {
  onCommand: (cmd: string) => void;
};

export default function CommandInput({ onCommand }: Props) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      onCommand(input.trim());
      setInput("");
    }
  };

  return (
    <div className="command-input-bar">
      <input
        autoFocus
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='コマンドを入力（例: /create add "メモ内容"）'
      />
    </div>
  );
}