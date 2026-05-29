import { useEffect, useMemo, useState } from 'react';
import puzzles from './data/puzzles.js';
import Grid from './components/Grid.jsx';
import ColorButtons from './components/ColorButtons.jsx';
import Controls from './components/Controls.jsx';
import Tutorial from './components/Tutorial.jsx';
import RuleInfo from './components/RuleInfo.jsx';
import TimePanel from './components/TimePanel.jsx';
import {
  buildGroups2D,
  gridToValues,
  validateByGroups,
  isFilled,
  cellKey,
  SIZE,
} from './utils/validate.js';
import { computeLineErrors, countBlanks, flagStage } from './utils/play.js';

// ★3 チート抑止：壁時計(Date.now)ではなく単調増加クロックを使い、
// OSの時計巻き戻しによる時間ごまかしを無効化する。
const monoNow = () =>
  typeof performance !== 'undefined' && performance.now
    ? performance.now()
    : Date.now();

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

  // --- タイマー関連（★3：performance.now ベース） ---
  const [times, setTimes] = useState({}); // index → クリア所要秒
  const [flags, setFlags] = useState({}); // index → { tooFewMoves, tooFast, suspicious }
  const [placeCount, setPlaceCount] = useState(0); // 現ステージで色を置いた回数（★2）
  const [stageStartAt, setStageStartAt] = useState(() => monoNow());
  const [now, setNow] = useState(() => monoNow());

  const hintKeys = useMemo(() => hintKeysOf(puzzle.initial), [puzzle]);
  const { rows: rowErrors, cols: colErrors } = useMemo(
    () => computeLineErrors(values),
    [values]
  );
  const hasLineError = rowErrors.some(Boolean) || colErrors.some(Boolean);

  // 解いた問題は記録時間を、未解答の問題は経過時間（ライブ）を表示
  const currentElapsedSec =
    times[index] != null ? times[index] : Math.floor((now - stageStartAt) / 1000);

  // 1秒ごとに now を更新してライブ表示
  useEffect(() => {
    const id = setInterval(() => setNow(monoNow()), 1000);
    return () => clearInterval(id);
  }, []);

  // 問題を切り替えたら状態とタイマー開始時刻をリセット（前の状態は保存しない）
  const loadPuzzle = (i) => {
    setIndex(i);
    setValues(gridToValues(puzzles[i].initial));
    setSelected(null);
    setResult(null);
    setPlaceCount(0);
    const t = monoNow();
    setStageStartAt(t);
    setNow(t);
  };

  const handleSelectCell = (key) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  const handlePick = (color) => {
    if (!selected) return; // マス未選択時は何もしない
    setValues((prev) => ({ ...prev, [selected]: color }));
    setPlaceCount((n) => n + 1); // ★2：操作回数を記録
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
    if (ok && times[index] == null) {
      const sec = Math.floor((monoNow() - stageStartAt) / 1000);
      // ★2：下限秒数と操作回数で記録の妥当性を判定
      const flag = flagStage({
        sec,
        placed: placeCount,
        blanks: countBlanks(puzzle.initial),
        difficulty: puzzle.difficulty,
      });
      setTimes((prev) => ({ ...prev, [index]: sec }));
      setFlags((prev) => ({ ...prev, [index]: flag }));
      console.log(
        `[いろロジック] クリア: id=${puzzle.id} 所要 ${sec}秒 操作 ${placeCount}回` +
          (flag.suspicious ? ' ⚠️記録対象外' : '')
      );
    } else {
      console.log(`[いろロジック] 確認: id=${puzzle.id} 判定=${ok ? '正解' : '不正解'}`, values);
    }
  };

  const handleReset = () => {
    setValues(gridToValues(puzzle.initial));
    setSelected(null);
    setResult(null);
    setPlaceCount(0);
    // このステージのタイム・フラグを取り消して計り直す
    setTimes((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setFlags((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    const t = monoNow();
    setStageStartAt(t);
    setNow(t);
  };

  const handlePrev = () => index > 0 && loadPuzzle(index - 1);
  const handleNext = () => index < puzzles.length - 1 && loadPuzzle(index + 1);

  const closeTutorial = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setShowTutorial(false);
    // チュートリアルを閉じてから計測開始
    const t = monoNow();
    setStageStartAt(t);
    setNow(t);
  };

  useEffect(() => {
    console.log(`[いろロジック] 問題 ${index + 1}/${puzzles.length} (id=${puzzle.id}, ${puzzle.difficulty})`);
  }, [index, puzzle]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#222] flex flex-col items-center px-4 py-5">
      {showTutorial && <Tutorial onClose={closeTutorial} />}

      <main className="w-full max-w-md flex flex-col items-center gap-4">
        <h1 className="text-[20px] font-bold">いろロジック</h1>

        <RuleInfo />

        <Grid
          values={values}
          hintKeys={hintKeys}
          selected={selected}
          rowErrors={rowErrors}
          colErrors={colErrors}
          onSelectCell={handleSelectCell}
        />

        {/* 許容されない配置（同色重複）の全体メッセージ */}
        {hasLineError && (
          <p className="text-red-600 font-bold text-[14px] text-center">
            ⚠️ おなじ いろが ならんでいる ぎょう／れつ を なおしてね
          </p>
        )}

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

        <TimePanel
          puzzles={puzzles}
          times={times}
          flags={flags}
          currentIndex={index}
          currentElapsedSec={currentElapsedSec}
        />
      </main>
    </div>
  );
}
