import Link from "next/link";

export default function HowTo() {
  return (
    <main className="container">
      <h2>操作方法・コマンド説明</h2>
      <p>
        本アプリは、<strong>キーボードのみで直感的に操作できるメモ&タスク管理アプリ</strong>です。<br />
        画面下部のコマンド入力欄にコマンドを入力し、Enterキーで実行します。
      </p>

      <section className="howto-section">
        <h3>1. クリエイト（Create）コマンド</h3>
        <p>メモの新規追加・編集・削除やチェックリスト機能を含むコマンド群です。</p>

        <h4>● メモの追加</h4>
        <ul>
          <li>
            <code>/create add "&lt;内容&gt;"</code>
            <ul>
              <li>通常のテキスト型メモを追加します。</li>
              <li>例: <code>/create add "牛乳を買う"</code></li>
            </ul>
          </li>
          <li>
            <code>/create add checklist "&lt;内容&gt;"</code>
            <ul>
              <li>チェックボックス付きのチェックリスト型メモを追加します。</li>
              <li>例: <code>/create add checklist "部屋を掃除する"</code></li>
            </ul>
          </li>
        </ul>
        <p>※ どちらもIDは自動で4桁連番（例: "0001"）となります。</p>

        <h4>● メモの編集</h4>
        <p><code>/create edit &lt;メモID&gt; "&lt;新しい内容&gt;"</code></p>
        <ul>
          <li>指定したIDのメモ内容を上書きします。</li>
          <li>例: <code>/create edit 0001 "パンも買う"</code></li>
        </ul>

        <h4>● メモの削除</h4>
        <p><code>/create delete &lt;メモID&gt;</code></p>
        <ul>
          <li>指定したIDのメモを削除します。</li>
          <li>例: <code>/create delete 0001</code></li>
        </ul>

        <h4>● チェックリスト状態の切り替え</h4>
        <p><code>/create checklist &lt;メモID&gt;</code></p>
        <ul>
          <li>チェックリスト型メモのチェック状態（ON/OFF）を切り替えます。</li>
          <li>例: <code>/create checklist 0002</code></li>
          <li>通常のテキスト型メモには使えません。</li>
        </ul>
      </section>
{/* 
      <section className="howto-section">
        <h3>2. コマンド（Command）コマンド</h3>
        <p>自作コマンド（＝コマンド文のテンプレート）を管理できます。</p>

        <h4>● 自作コマンドの追加</h4>
        <p><code>/command add &lt;コマンド名&gt; "&lt;コマンド内容&gt;"</code></p>
        <ul>
          <li>新しい自作コマンドを追加します。</li>
          <li>例:<br />
            <code>/command add greet "echo Hello"</code><br />
            <code>/command add todo "create add daily $1 checklist \"$2\""</code>
          </li>
        </ul>

        <h4>● 自作コマンドの編集</h4>
        <p><code>/command edit &lt;コマンド名&gt; "&lt;新しいコマンド内容&gt;"</code></p>
        <ul>
          <li>登録済みの自作コマンドの内容を編集します。</li>
          <li>例: <code>/command edit greet "echo Hi"</code></li>
        </ul>

        <h4>● 自作コマンドの削除</h4>
        <p><code>/command delete &lt;コマンド名&gt;</code></p>
        <ul>
          <li>自作コマンドを削除します。</li>
          <li>例: <code>/command delete greet</code></li>
        </ul>

        <h4>● 自作コマンド一覧</h4>
        <p><code>/command list</code></p>
        <ul>
          <li>すべての自作コマンド名を一覧表示します。</li>
        </ul>

        <h4>● 自作コマンド詳細表示</h4>
        <p><code>/command show &lt;コマンド名&gt;</code></p>
        <ul>
          <li>指定した自作コマンドの内容（テンプレート）を表示します。</li>
          <li>例: <code>/command show greet</code></li>
        </ul>
      </section> */}

      <section className="howto-section">
        <h3>3. チェックリスト機能について</h3>
        <ul>
          <li>チェックリスト型メモは追加時に <code>/create add checklist "&lt;内容&gt;"</code> で登録できます。</li>
          <li>チェック状態は <code>/create checklist &lt;メモID&gt;</code> で切り替えます。</li>
          <li>チェックリスト型メモはリスト表示時にチェックボックスが表示されます（UIによる）。</li>
        </ul>
      </section>

      <section className="howto-section">
        <h3>4. 注意事項・ヒント</h3>
        <ul>
          <li>メモIDは常に4桁（"0001", "0002" ...）です。編集・削除・チェック切替はIDで指定してください。</li>
          <li>入力は<strong>必ず半角英数字</strong>で行ってください。</li>
          {/* <li>未対応のコマンドや記法エラー時はエラーメッセージが表示されます。</li>
          <li>新しい自作コマンドを登録することで、複雑な操作を効率化できます。</li> */}
        </ul>
      </section>

      <section className="howto-section">
        <h3>5. よくあるエラー例</h3>
        <ul>
          <li><code>/create edit 1 "内容"</code> &rarr; <strong>NG!</strong><br />
            &rarr; 正しくは <code>/create edit 0001 "内容"</code></li>
          {/* <li><code>/command add greet echo Hello</code> &rarr; <strong>NG!</strong><br />
            &rarr; 正しくは <code>/command add greet "echo Hello"</code></li> */}
          <li><code>/create checklist 0001</code> &rarr; テキスト型メモには使えません（チェックリスト型のみ）</li>
        </ul>
      </section>

      {/* <section className="howto-section">
        <h3>6. サポート</h3>
        <p>ご不明点・ご意見はGitHubリポジトリまたは管理者までご連絡ください。</p>
      </section> */}

      <div className="mt-1">
        <Link href="/">トップへ戻る</Link>
      </div>
    </main>
  );
}