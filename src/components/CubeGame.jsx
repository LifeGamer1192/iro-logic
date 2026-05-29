// 3D（層スライス＝ラテン立方）モードのゲーム本体。
// 3×3×3 を3段の展開図として描き、線ベース validate を27本の線で再利用する。
import { useMemo, useState } from 'react';
import cubePuzzles from '../data/puzzles3d.js';
import ColorButtons from './ColorButtons.jsx';
import {
  cubeToValues,
  cubeHintKeys,
  cubeErrorKeys,
  validateCube,
  isCubeFilled,
  SIZE3,
} from '../utils/cube.js';
import { cellKey } from '../utils/validate.js';

const COLOR_LABEL = { red: 'あか', yellow: 'きいろ', blue: 'あお' };

// 3D用の小さめセル（色＋テクスチャ＋選択/エラー/ヒント表示）
function CubeCell({ color, isHint, isSelected, isError, onSelect }) {
  const border = isSelected
    ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.5)] z-10'
    : isError
      ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.45)] z-10'
      : 'border-[#333]';
  return (
    <button
      type="button"
      onClick={isHint ? undefined : onSelect}
      disabled={isHint}
      aria-label={color ? `${COLOR_LABEL[color]}${isHint ? '（ヒント）' : ''}` : 'からのマス'}
      aria-pressed={isSelected}
      className={
        'flex items-center justify-center w-14 h-14 pc:w-16 pc:h-16 border-2 box-border ' +
        (color ? `iro-cell iro-${color}` : 'bg-white') +
        ' ' +
        border +
        (isHint ? ' cursor-default' : ' cursor-pointer')
      }
    >
      {isHint && <span className="text-sm opacity-70" aria-hidden="true">🔒</span>}
    </button>
  );
}

function Layer({ z, values, hintKeys, errorKeys, selected, onSelectCell }) {
  const idx = Array.from({ length: SIZE3 }, (_, i) => i);
  return (
    <figure className="flex flex-col items-center gap-1">
      <figcaption className="text-[13px] font-bold text-gray-600">{z + 1}だんめ</figcaption>
      <div
        className="inline-grid bg-[#333]"
        style={{ gridTemplateColumns: `repeat(${SIZE3}, max-content)` }}
      >
        {idx.map((r) =>
          idx.map((c) => {
            const key = cellKey(z, r, c);
            return (
              <CubeCell
                key={key}
                color={values[key] ?? null}
                isHint={hintKeys.has(key)}
                isSelected={selected === key}
                isError={errorKeys.has(key)}
                onSelect={() => onSelectCell(key)}
              />
            );
          })
        )}
      </div>
    </figure>
  );
}

export default function CubeGame() {
  const [index, setIndex] = useState(0);
  const puzzle = cubePuzzles[index];

  const [values, setValues] = useState(() => cubeToValues(puzzle.initial));
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | 'incomplete' | null

  const hintKeys = useMemo(() => cubeHintKeys(puzzle.initial), [puzzle]);
  const errorKeys = useMemo(() => cubeErrorKeys(values), [values]);
  const hasError = errorKeys.size > 0;

  const load = (i) => {
    setIndex(i);
    setValues(cubeToValues(cubePuzzles[i].initial));
    setSelected(null);
    setResult(null);
  };

  const handleSelect = (key) => setSelected((prev) => (prev === key ? null : key));

  const handlePick = (color) => {
    if (!selected) return;
    setValues((prev) => ({ ...prev, [selected]: color }));
    setResult(null);
  };

  const handleCheck = () => {
    if (!isCubeFilled(values)) {
      setResult('incomplete');
      return;
    }
    setResult(validateCube(values) ? 'correct' : 'wrong');
  };

  const handleReset = () => {
    setValues(cubeToValues(puzzle.initial));
    setSelected(null);
    setResult(null);
  };

  const message = {
    correct: { text: 'せいかい！すごい！ 🎉', cls: 'bg-green-100 text-green-800 border-green-400' },
    wrong: { text: 'もういちど かんがえてね 🤔', cls: 'bg-amber-100 text-amber-800 border-amber-400' },
    incomplete: { text: 'ぜんぶ いろを おいてね ✏️', cls: 'bg-sky-100 text-sky-800 border-sky-400' },
  }[result];

  const btn =
    'min-h-[50px] px-3 rounded-xl font-bold text-[16px] transition-colors cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-blue-300';

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* ルール説明（3D版） */}
      <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
        <p className="text-[14px] font-bold leading-snug">
          3Dルール：<span className="text-ironote-red">あか</span>・
          <span className="text-yellow-600">きいろ</span>・
          <span className="text-ironote-blue">あお</span> を、
          <br />
          ・各段の たて・よこ に 1つずつ
          <br />
          ・<b>同じマスを 上下に つらぬく「はしら」</b>にも 1つずつ
        </p>
      </section>

      {/* 3段の層スライス */}
      <div className="flex flex-row flex-wrap justify-center gap-4">
        {Array.from({ length: SIZE3 }, (_, z) => (
          <Layer
            key={z}
            z={z}
            values={values}
            hintKeys={hintKeys}
            errorKeys={errorKeys}
            selected={selected}
            onSelectCell={handleSelect}
          />
        ))}
      </div>

      {hasError && (
        <p className="text-red-600 font-bold text-[14px] text-center">
          ⚠️ おなじ いろが ならんでいる れつ／はしら が あるよ
        </p>
      )}

      <p className="text-[14px] text-gray-600 min-h-[20px]">
        {selected ? 'いろボタンで うめてね' : 'マスを えらんでね'}
      </p>

      <ColorButtons onPick={handlePick} disabled={!selected} />

      {/* 判定メッセージ */}
      <div
        className={
          'w-full min-h-[48px] flex items-center justify-center rounded-xl border-2 text-[17px] font-bold text-center px-2 ' +
          (message ? message.cls : 'border-transparent text-transparent')
        }
        role="status"
        aria-live="polite"
      >
        {message ? message.text : '　'}
      </div>

      <div className="w-full flex items-center justify-between text-[18px] font-bold text-[#222]">
        <span>
          {index + 1} / {cubePuzzles.length}
        </span>
        <span className="text-[13px] px-2 py-1 rounded-full bg-purple-100 text-purple-700">
          3D・じょうきゅう（ヒント{puzzle.hints}）
        </span>
      </div>

      <button type="button" onClick={handleCheck} className={`${btn} w-full bg-blue-500 hover:bg-gray-800 text-white text-[18px]`}>
        ✅ かくにん
      </button>

      <div className="w-full grid grid-cols-3 gap-2">
        <button type="button" onClick={() => index > 0 && load(index - 1)} disabled={index === 0} className={`${btn} bg-gray-200 hover:bg-gray-300 text-[#222]`}>
          ◀ まえ
        </button>
        <button type="button" onClick={handleReset} className={`${btn} bg-gray-200 hover:bg-gray-300 text-[#222]`}>
          ↺ やりなおす
        </button>
        <button
          type="button"
          onClick={() => index < cubePuzzles.length - 1 && load(index + 1)}
          disabled={index >= cubePuzzles.length - 1}
          className={`${btn} text-white ${result === 'correct' ? 'bg-green-500 hover:bg-green-600 animate-pulse' : 'bg-blue-500 hover:bg-gray-800'}`}
        >
          つぎ ▶
        </button>
      </div>
    </div>
  );
}
