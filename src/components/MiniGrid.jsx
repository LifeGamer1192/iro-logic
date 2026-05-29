// 説明用の小さな3×3グリッド（OK/NG例で再利用）。errorKeys は "r,c" の集合。
import { cellKey } from '../utils/validate.js';

export default function MiniGrid({ grid, errorKeys, cell = 24 }) {
  return (
    <div
      className="inline-grid"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, ${cell}px)` }}
    >
      {grid.map((row, r) =>
        row.map((color, c) => {
          const isErr = errorKeys?.has(cellKey(r, c));
          return (
            <span
              key={cellKey(r, c)}
              className={
                (color ? `iro-cell iro-${color}` : 'bg-white') +
                ' border ' +
                (isErr ? 'border-red-500 outline outline-2 outline-red-500 z-10' : 'border-[#333]')
              }
              style={{ width: cell, height: cell }}
              aria-hidden="true"
            />
          );
        })
      )}
    </div>
  );
}
