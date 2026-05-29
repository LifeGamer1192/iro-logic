import Cell from './Cell.jsx';
import { SIZE, cellKey } from '../utils/validate.js';

// 各マスと同じ幅（レスポンシブ）。列エラーバッジを列の真下に揃えるために使う。
const CELL_W = 'w-[70px] tab:w-[75px] pc:w-[85px] xl:w-[100px]';
const GUTTER_W = 'w-[64px]'; // 行エラーメッセージ用の右余白

// 3×3 グリッド。状態は「座標キー→色」のマップ（仕様書§12.3-2）。
// rowErrors/colErrors: 各行・各列に同色重複（許容されない配置）があるか。
export default function Grid({ values, hintKeys, selected, rowErrors, colErrors, onSelectCell }) {
  const rows = Array.from({ length: SIZE }, (_, r) => r);
  const cols = Array.from({ length: SIZE }, (_, c) => c);

  return (
    <div className="inline-flex flex-col mx-auto" role="group" aria-label="3かける3のマス">
      {rows.map((r) => (
        <div key={r} className="flex items-center">
          <div className="inline-flex bg-[#333]">
            {cols.map((c) => {
              const key = cellKey(r, c);
              const isHint = hintKeys.has(key);
              return (
                <Cell
                  key={key}
                  color={values[key] ?? null}
                  isHint={isHint}
                  isSelected={selected === key}
                  isError={rowErrors[r] || colErrors[c]}
                  disabled={isHint}
                  onSelect={() => onSelectCell(key)}
                />
              );
            })}
          </div>
          {/* 行（よこ）のエラーメッセージ */}
          <div className={`${GUTTER_W} pl-1 flex items-center`}>
            {rowErrors[r] && (
              <span
                className="inline-flex items-center gap-0.5 bg-red-500 text-white text-[11px] font-bold rounded px-1.5 py-0.5"
                title="この よこの れつに おなじ いろが 2つ あるよ"
              >
                ⬅よこ
              </span>
            )}
          </div>
        </div>
      ))}

      {/* 列（たて）のエラーメッセージ（各列の真下に、上向き矢印つきで分かりやすく） */}
      <div className="flex">
        {cols.map((c) => (
          <div key={c} className={`${CELL_W} flex flex-col items-center pt-1 leading-tight`}>
            {colErrors[c] && (
              <span
                className="inline-flex flex-col items-center bg-red-500 text-white text-[11px] font-bold rounded px-1.5 py-0.5"
                title="この たての れつに おなじ いろが 2つ あるよ"
              >
                <span aria-hidden="true">⬆</span>
                <span>たてNG</span>
              </span>
            )}
          </div>
        ))}
        <div className={GUTTER_W} />
      </div>
    </div>
  );
}
