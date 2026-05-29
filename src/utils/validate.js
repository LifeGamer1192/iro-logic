// いろロジック ルール検証ロジック
//
// 【3D版への前方互換設計：仕様書§12.3-1】
// 行/列をベタ書きせず、「制約グループ（line）= セルキーの集合」のリストを
// 受け取って各グループが3色ちょうど1個ずつかを検証する汎用関数として実装する。
// - 初級版（2D 3×3）：行3本 + 列3本 = 6本の線
// - 将来の層スライス版（3×3×3）：同じ関数に27本の線を渡すだけで動く
//
// 状態は「座標キー(文字列) → 色」のマップで保持する（仕様書§12.3-2）。

export const SIZE = 3;
export const COLORS = ['red', 'yellow', 'blue'];

/** 座標から状態マップ用のキーを作る（2Dは "r,c"、3Dは "x,y,z" に拡張可能） */
export const cellKey = (...coords) => coords.join(',');

/**
 * 2D 3×3 グリッドの制約グループ（線）を生成する。
 * 各行・各列をセルキーの配列として返す。
 * @returns {string[][]} 線（セルキー集合）のリスト
 */
export const buildGroups2D = (size = SIZE) => {
  const groups = [];
  for (let r = 0; r < size; r++) {
    groups.push(Array.from({ length: size }, (_, c) => cellKey(r, c))); // 行
  }
  for (let c = 0; c < size; c++) {
    groups.push(Array.from({ length: size }, (_, r) => cellKey(r, c))); // 列
  }
  return groups;
};

/** 状態マップ（{key: color} or Map）から色を取り出すアクセサ */
const reader = (values) =>
  values instanceof Map ? (k) => values.get(k) : (k) => values[k];

/**
 * すべての線が「色数ぶんちょうど1個ずつ」を満たすか検証する（汎用・次元非依存）。
 * @param {Object|Map} values 座標キー→色 のマップ
 * @param {string[][]} groups 線（セルキー集合）のリスト
 * @returns {boolean}
 */
export const validateByGroups = (values, groups, colors = COLORS) => {
  const get = reader(values);
  for (const group of groups) {
    const placed = group.map(get).filter(Boolean);
    if (placed.length !== colors.length) return false; // 埋まっていない
    if (new Set(placed).size !== colors.length) return false; // 色の重複あり
  }
  return true;
};

/**
 * 全セルが埋まっているか（「確認」前のガード用）。
 * groups に登場する全キーが値を持つかで判定する。
 */
export const isFilled = (values, groups) => {
  const get = reader(values);
  const keys = new Set(groups.flat());
  for (const k of keys) {
    if (!get(k)) return false;
  }
  return true;
};

// ---- 仕様書§7 互換のユーティリティ（2D配列 ⇔ 状態マップ変換） ----

/** 2D配列（color|null） → 状態マップ {"r,c": color} */
export const gridToValues = (grid) => {
  const values = {};
  grid.forEach((row, r) =>
    row.forEach((color, c) => {
      if (color) values[cellKey(r, c)] = color;
    })
  );
  return values;
};

/** 状態マップ → 2D配列（color|null） */
export const valuesToGrid = (values, size = SIZE) => {
  const get = reader(values);
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => get(cellKey(r, c)) ?? null)
  );
};

/**
 * 仕様書§7 と同じシグネチャの薄いラッパー。
 * 内部では線ベースの validateByGroups に委譲する。
 * @param {Array<Array<string|null>>} grid 2D配列
 */
export const validateGrid = (grid) =>
  validateByGroups(gridToValues(grid), buildGroups2D());
