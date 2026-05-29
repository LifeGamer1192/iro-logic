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
          <div className={`${GUTTER_W} pl-1 text-left text-red-600 text-[12px] font-bold leading-tight`}>
            {rowErrors[r] && (
              <span title="この よこの れつに おなじ いろが あるよ">⚠️ おなじ</span>
            )}
          </div>
        </div>
      ))}

      {/* 列（たて）のエラーメッセージ（各列の真下に配置） */}
      <div className="flex">
        {cols.map((c) => (
          <div
            key={c}
            className={`${CELL_W} text-center text-red-600 text-[12px] font-bold pt-1 leading-tight`}
          >
            {colErrors[c] && (
              <span title="この たての れつに おなじ いろが あるよ">⚠️ おなじ</span>
            )}
          </div>
        ))}
        <div className={GUTTER_W} />
      </div>
    </div>
  );
}
