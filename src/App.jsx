import { useEffect, useMemo, useState } from 'react';
import puzzles from './data/puzzles.js';
import Grid from './components/Grid.jsx';
import ColorButtons from './components/ColorButtons.jsx';
import Controls from './components/Controls.jsx';
import Tutorial from './components/Tutorial.jsx';
import {
  buildGroups2D,
  gridToValues,
  validateByGroups,
  isFilled,
  cellKey,
  SIZE,
} from './utils/validate.js';

const TUTORIAL_KEY = 'iro-logic:tutorial-seen';

// initial(2D配列) から「ヒントのセルキー集合」を作る
const hintKeysOf = (initial) => {
  const keys = new Set();
  initial.forEach((row, r) =>
    row.forEach((color, c) => {
      if (color) keys.add(cellKey(r, c));
    })
  );
  return keys;
};

export default function App() {
  const groups = useMemo(() => buildGroups2D(SIZE), []);

  const [index, setIndex] = useState(0);
  const puzzle = puzzles[index];

  // 状態は「座標キー→色」のマップ（仕様書§12.3-2）
  const [values, setValues] = useState(() => gridToValues(puzzle.initial));
  const [selected, setSelected] = useState(null); // 選択中のセルキー or null
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | 'incomplete' | null
  const [showTutorial, setShowTutorial] = useState(
    () => localStorage.getItem(TUTORIAL_KEY) !== '1'
  );

  const hintKeys = useMemo(() => hintKeysOf(puzzle.initial), [puzzle]);

  // 問題を切り替えたら状態をリセット（前の問題の状態は保存しない：仕様書§3.2）
  const loadPuzzle = (i) => {
    setIndex(i);
    setValues(gridToValues(puzzles[i].initial));
    setSelected(null);
    setResult(null);
  };

  const handleSelectCell = (key) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  const handlePick = (color) => {
    if (!selected) return; // マス未選択時は何もしない
    setValues((prev) => ({ ...prev, [selected]: color }));
    setResult(null); // 入力が変わったら判定結果はクリア
  };

  const handleCheck = () => {
    if (!isFilled(values, groups)) {
      setResult('incomplete');
      console.log('[いろロジック] 確認: 未入力あり', values);
      return;
    }
    const ok = validateByGroups(values, groups);
    setResult(ok ? 'correct' : 'wrong');
    console.log(`[いろロジック] 確認: id=${puzzle.id} 判定=${ok ? '正解' : '不正解'}`, values);
  };

  const handleReset = () => {
    setValues(gridToValues(puzzle.initial));
    setSelected(null);
    setResult(null);
  };

  const handlePrev = () => index > 0 && loadPuzzle(index - 1);
  const handleNext = () => index < puzzles.length - 1 && loadPuzzle(index + 1);

  const closeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
  };

  // デバッグ：現在のグリッド状態を確認できるようにする（仕様書§10 デバッグ対応）
  useEffect(() => {
    console.log(`[いろロジック] 問題 ${index + 1}/${puzzles.length} (id=${puzzle.id}, ${puzzle.difficulty})`);
  }, [index, puzzle]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#222] flex flex-col items-center px-4 py-5">
      {showTutorial && <Tutorial onClose={closeTutorial} />}

      <main className="w-full max-w-md flex flex-col items-center gap-5">
        <h1 className="text-[20px] font-bold">いろロジック</h1>

        <Grid
          values={values}
          hintKeys={hintKeys}
          selected={selected}
          onSelectCell={handleSelectCell}
        />

        <p className="text-[14px] text-gray-600 min-h-[20px]">
          {selected ? 'いろボタンで うめてね' : 'マスを えらんでね'}
        </p>

        <ColorButtons onPick={handlePick} disabled={!selected} />

        <Controls
          index={index}
          total={puzzles.length}
          difficulty={puzzle.difficulty}
          result={result}
          onCheck={handleCheck}
          onReset={handleReset}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </main>
    </div>
  );
}
