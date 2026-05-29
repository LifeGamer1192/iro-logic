// 操作ボタン群（確認・やり直す・前へ・次へ）＋進捗＋判定メッセージ。
// スマホでは全幅・高さ50px以上（仕様書§3.3 / §6）。

const DIFF_LABEL = { easy: 'しょきゅう', medium: 'ちゅうきゅう', hard: 'じょうきゅう' };

const baseBtn =
  'min-h-[50px] px-3 rounded-xl font-bold text-[16px] ' +
  'transition-colors duration-100 cursor-pointer ' +
  'disabled:opacity-40 disabled:cursor-default ' +
  'focus:outline-none focus:ring-4 focus:ring-blue-300';

export default function Controls({
  index,
  total,
  difficulty,
  result,
  onCheck,
  onReset,
  onPrev,
  onNext,
}) {
  // 判定メッセージ（色のみに依存せずテキスト＋絵文字で伝える：仕様書§5）
  const message = {
    correct: { text: 'せいかい！つぎへ すすもう 🎉', cls: 'bg-green-100 text-green-800 border-green-400' },
    wrong: { text: 'もういちど かんがえてね 🤔', cls: 'bg-amber-100 text-amber-800 border-amber-400' },
    incomplete: { text: 'ぜんぶ いろを おいてね ✏️', cls: 'bg-sky-100 text-sky-800 border-sky-400' },
  }[result];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 進捗表示（18px以上） */}
      <div className="flex items-center justify-between text-[18px] font-bold text-[#222]">
        <span>
          {index + 1} / {total}
        </span>
        <span className="text-[14px] px-2 py-1 rounded-full bg-gray-200 text-gray-700">
          {DIFF_LABEL[difficulty] ?? difficulty}
        </span>
      </div>

      {/* 判定メッセージ（高さを確保してレイアウトのガタつきを防ぐ） */}
      <div
        className={
          'min-h-[48px] flex items-center justify-center rounded-xl border-2 text-[17px] font-bold text-center px-2 ' +
          (message ? message.cls : 'border-transparent text-transparent')
        }
        role="status"
        aria-live="polite"
      >
        {message ? message.text : '　'}
      </div>

      {/* 確認ボタン（最も目立たせる・全幅） */}
      <button
        type="button"
        onClick={onCheck}
        className={`${baseBtn} w-full bg-blue-500 hover:bg-gray-800 text-white text-[18px]`}
      >
        ✅ かくにん
      </button>

      {/* 前へ / やり直す / 次へ */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className={`${baseBtn} bg-gray-200 hover:bg-gray-300 text-[#222]`}
        >
          ◀ まえ
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`${baseBtn} bg-gray-200 hover:bg-gray-300 text-[#222]`}
        >
          ↺ やりなおす
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={index >= total - 1}
          className={
            `${baseBtn} text-white ` +
            (result === 'correct'
              ? 'bg-green-500 hover:bg-green-600 animate-pulse'
              : 'bg-blue-500 hover:bg-gray-800')
          }
        >
          つぎ ▶
        </button>
      </div>
    </div>
  );
}
