// 1マス分の表示。色 + CVDテクスチャ + 選択/ヒントの視覚フィードバックを担う。

const COLOR_LABEL = { red: 'あか', yellow: 'きいろ', blue: 'あお' };

export default function Cell({ color, isHint, isSelected, isError, disabled, onSelect }) {
  const base =
    'flex items-center justify-center select-none ' +
    'w-[70px] h-[70px] tab:w-[75px] tab:h-[75px] pc:w-[85px] pc:h-[85px] xl:w-[100px] xl:h-[100px] ' +
    'border-2 box-border transition-[box-shadow,transform] duration-100';

  // 色 + テクスチャ（color が無いマスは白）
  const colorClass = color ? `iro-cell iro-${color}` : 'bg-white';

  // 枠線：選択中=青、エラー行/列=赤、通常=濃いグレー
  const borderClass = isSelected
    ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.5)] z-10'
    : isError
      ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.45)] z-10'
      : 'border-[#333]';

  // ヒントマスは編集不可（仕様書§12.4）。空きマスのみクリック可。
  const cursorClass = disabled ? 'cursor-default' : 'cursor-pointer';

  // スクリーンリーダー/色覚対応：状態をテキストでも伝える
  const aria = color
    ? `${COLOR_LABEL[color]}${isHint ? '（ヒント）' : ''}`
    : 'からのマス';

  return (
    <button
      type="button"
      className={`${base} ${colorClass} ${borderClass} ${cursorClass}`}
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-label={aria}
      aria-pressed={isSelected}
    >
      {/* ヒントマスには小さな鍵マーク（色のみに依存しない手がかり） */}
      {isHint && <span className="text-base opacity-70" aria-hidden="true">🔒</span>}
    </button>
  );
}
