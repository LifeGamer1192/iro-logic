// 色選択ボタン（赤・黄・青）。CVDテクスチャ付き・ホバーで明るくなる。
import { COLORS } from '../utils/validate.js';

const LABEL = { red: 'あか', yellow: 'きいろ', blue: 'あお' };

export default function ColorButtons({ onPick, disabled }) {
  return (
    <div
      className="flex flex-row flex-wrap justify-center gap-3 pc:gap-4"
      role="group"
      aria-label="いろをえらぶ"
    >
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onPick(color)}
          disabled={disabled}
          aria-label={LABEL[color]}
          className={
            `iro-cell iro-${color} ` +
            'w-[64px] h-[64px] pc:w-[72px] pc:h-[72px] ' +
            'border-2 border-[#333] rounded-lg ' +
            'flex items-end justify-center pb-1 ' +
            'transition-[filter,transform] duration-100 ' +
            'hover:brightness-110 active:scale-95 cursor-pointer ' +
            'disabled:opacity-40 disabled:cursor-default ' +
            'focus:outline-none focus:ring-4 focus:ring-blue-300'
          }
        >
          <span className="text-[13px] font-bold text-[#222] bg-white/75 rounded px-1 leading-tight">
            {LABEL[color]}
          </span>
        </button>
      ))}
    </div>
  );
}
