// プレイ補助ロジック（タイマー集計・行/列エラー検出）。
// UIから切り離した純粋関数として実装し、テストで確実にカバーする。
import { cellKey } from './validate.js';

/** 秒数を mm:ss 形式に整形する */
export const formatTime = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

/** 1本の線（セルキー配列）に同色の重複があるか */
export const lineHasDuplicate = (values, keys) => {
  const placed = keys.map((k) => values[k]).filter(Boolean);
  return new Set(placed).size !== placed.length;
};

/**
 * 各行・各列に「同色の重複（=許容されない配置）」があるかを返す。
 * @returns {{rows: boolean[], cols: boolean[]}}
 */
export const computeLineErrors = (values, size = 3) => {
  const idx = Array.from({ length: size }, (_, i) => i);
  const rows = idx.map((r) =>
    lineHasDuplicate(values, idx.map((c) => cellKey(r, c)))
  );
  const cols = idx.map((c) =>
    lineHasDuplicate(values, idx.map((r) => cellKey(r, c)))
  );
  return { rows, cols };
};

// --- チート抑止（★3 performance.now は App 側で使用、ここは ★2 の判定ロジック） ---

// 難易度別の下限秒数（これ未満は物理的にありえない＝記録対象外）。調整可。
// 根拠：空きマス×2タップを最速 約3タップ/秒で行った場合の所要時間。
export const MIN_PLAUSIBLE_SEC = { easy: 3, medium: 4, hard: 5 };

/** initial(2D配列) の空きマス数を数える */
export const countBlanks = (initial) =>
  initial.reduce((sum, row) => sum + row.filter((c) => c == null).length, 0);

/**
 * 1ステージのクリア記録が不正（怪しい）かを判定する。
 * - tooFewMoves：色を置いた回数が空きマス数に満たない（盤面注入など物理的に不可能）
 * - tooFast：所要時間が難易度別の下限を下回る
 * @returns {{ tooFewMoves: boolean, tooFast: boolean, suspicious: boolean }}
 */
export const flagStage = ({ sec, placed, blanks, difficulty }) => {
  const tooFewMoves = placed < blanks;
  const floor = MIN_PLAUSIBLE_SEC[difficulty] ?? 3;
  const tooFast = sec < floor;
  return { tooFewMoves, tooFast, suspicious: tooFewMoves || tooFast };
};

/**
 * 記録（times: {index: 秒}）から短い検証コードを導出する。
 * スクショの数字を改ざんするとコードが一致しなくなり、確認者が後から照合できる。
 * （アルゴリズムはバンドルに含まれるため casual 改ざん抑止が目的）
 */
export const verificationCode = (times, { tampered = false } = {}) => {
  const canonical =
    (tampered ? 'X|' : '') +
    Object.keys(times)
      .map(Number)
      .sort((a, b) => a - b)
      .map((i) => `${i}:${times[i]}`)
      .join('|');
  let h = 0x811c9dc5; // FNV-1a 32bit
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
};

/**
 * 各ステージの所要時間（times: {index: 秒}）を難易度ごと・全体で集計する。
 * @param {Object} times 解いたステージの index → 秒
 * @param {Array} puzzles パズル配列（difficulty を持つ）
 */
export const summarizeTimes = (times, puzzles) => {
  const order = ['easy', 'medium', 'hard'];
  const byDiff = {};
  order.forEach((d) => (byDiff[d] = { total: 0, done: 0, count: 0 }));

  puzzles.forEach((p, i) => {
    const d = p.difficulty;
    if (!byDiff[d]) byDiff[d] = { total: 0, done: 0, count: 0 };
    byDiff[d].count += 1;
    if (times[i] != null) {
      byDiff[d].total += times[i];
      byDiff[d].done += 1;
    }
  });

  const grandTotal = Object.values(times).reduce((a, b) => a + b, 0);
  const doneCount = Object.keys(times).length;
  return {
    byDiff,
    order,
    grandTotal,
    doneCount,
    total: puzzles.length,
    allDone: doneCount === puzzles.length && puzzles.length > 0,
  };
};
