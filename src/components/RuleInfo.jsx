// ルール説明＋OK/NG配置例（プレイ画面のタイトル直下に表示）。
import { cellKey } from '../utils/validate.js';

const OK_GRID = [
  ['red', 'yellow', 'blue'],
  ['yellow', 'blue', 'red'],
  ['blue', 'red', 'yellow'],
];

// NG例：列0 が あか・きいろ・あか で「あか」が重複（許容されない配置）
const NG_GRID = [
  ['red', 'yellow', 'blue'],
  ['yellow', 'blue', 'red'],
  ['red', 'blue', 'yellow'],
];
const NG_ERROR_KEYS = new Set([cellKey(0, 0), cellKey(2, 0)]); // 重複している あか

function MiniGrid({ grid, errorKeys }) {
  return (
    <div className="inline-grid" style={{ gridTemplateColumns: 'repeat(3, 22px)' }}>
      {grid.map((row, r) =>
        row.map((color, c) => {
          const isErr = errorKeys?.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className={
                `iro-cell iro-${color} w-[22px] h-[22px] border ` +
                (isErr ? 'border-red-500 outline outline-2 outline-red-500 z-10' : 'border-[#333]')
              }
              aria-hidden="true"
            />
          );
        })
      )}
    </div>
  );
}

export default function RuleInfo() {
  return (
    <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
      <p className="text-[15px] font-bold leading-snug">
        ルール：たて・よこ どの れつにも、
        <span className="text-ironote-red">あか</span>・
        <span className="text-yellow-600">きいろ</span>・
        <span className="text-ironote-blue">あお</span>
        を ちょうど 1つずつ。
      </p>

      <div className="mt-3 flex gap-4 justify-center">
        <figure className="flex flex-col items-center gap-1">
          <figcaption className="text-[13px] font-bold text-green-700">⭕ OK</figcaption>
          <MiniGrid grid={OK_GRID} />
          <span className="text-[11px] text-gray-600">3しょく そろってる</span>
        </figure>

        <figure className="flex flex-col items-center gap-1">
          <figcaption className="text-[13px] font-bold text-red-700">❌ NG</figcaption>
          <MiniGrid grid={NG_GRID} errorKeys={NG_ERROR_KEYS} />
          <span className="text-[11px] text-gray-600">たてに あかが 2つ</span>
        </figure>
      </div>
    </section>
  );
}
