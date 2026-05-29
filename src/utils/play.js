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
