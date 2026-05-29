import Cell from './Cell.jsx';
import { SIZE, cellKey } from '../utils/validate.js';

// 3×3 グリッド。状態は「座標キー→色」のマップ（仕様書§12.3-2）。
export default function Grid({ values, hintKeys, selected, onSelectCell }) {
  const rows = Array.from({ length: SIZE }, (_, r) => r);
  const cols = Array.from({ length: SIZE }, (_, c) => c);

  return (
    <div
      className="inline-grid gap-0 bg-[#333] p-0 mx-auto"
      style={{ gridTemplateColumns: `repeat(${SIZE}, max-content)` }}
      role="group"
      aria-label="3かける3のマス"
    >
      {rows.map((r) =>
        cols.map((c) => {
          const key = cellKey(r, c);
          const isHint = hintKeys.has(key);
          return (
            <Cell
              key={key}
              color={values[key] ?? null}
              isHint={isHint}
              isSelected={selected === key}
              disabled={isHint}
              onSelect={() => onSelectCell(key)}
            />
          );
        })
      )}
    </div>
  );
}
