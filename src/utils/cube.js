// 3D（層スライス＝ラテン立方）用の制約・状態ヘルパー。
// 既存の線ベース validate（§12.3 前方互換）をそのまま再利用する。
import { cellKey, COLORS, validateByGroups, isFilled } from './validate.js';

export const SIZE3 = 3;
export { COLORS };

/**
 * ラテン立方の27本の線（セルキー集合）を生成する。
 * - 各段の行：z×r ごと 9本
 * - 各段の列：z×c ごと 9本
 * - 柱（z方向）：r×c ごと 9本
 * キーは "z,r,c"。
 */
export const buildGroups3D = (size = SIZE3) => {
  const idx = Array.from({ length: size }, (_, i) => i);
  const groups = [];
  // 段ごとの行・列
  for (const z of idx) {
    for (const r of idx) groups.push(idx.map((c) => cellKey(z, r, c))); // 行
    for (const c of idx) groups.push(idx.map((r) => cellKey(z, r, c))); // 列
  }
  // 柱（z方向）
  for (const r of idx) {
    for (const c of idx) groups.push(idx.map((z) => cellKey(z, r, c)));
  }
  return groups;
};

/** cube[z][r][c]（色 or null）→ 状態マップ {"z,r,c": color} */
export const cubeToValues = (cube) => {
  const values = {};
  cube.forEach((layer, z) =>
    layer.forEach((row, r) =>
      row.forEach((color, c) => {
        if (color) values[cellKey(z, r, c)] = color;
      })
    )
  );
  return values;
};

/** initial(cube) からヒントのセルキー集合を作る */
export const cubeHintKeys = (initial) => {
  const keys = new Set();
  initial.forEach((layer, z) =>
    layer.forEach((row, r) =>
      row.forEach((color, c) => {
        if (color) keys.add(cellKey(z, r, c));
      })
    )
  );
  return keys;
};

/** initial の空きマス数 */
export const cubeBlanks = (initial) =>
  initial.reduce(
    (sum, layer) => sum + layer.reduce((s, row) => s + row.filter((c) => c == null).length, 0),
    0
  );

/**
 * 27本の線のうち、同色重複（許容されない配置）がある「エラーセルキー集合」を返す。
 * エラー線に属する全セルを赤表示するために使う。
 */
export const cubeErrorKeys = (values, size = SIZE3) => {
  const groups = buildGroups3D(size);
  const errors = new Set();
  for (const group of groups) {
    const placed = group.map((k) => values[k]).filter(Boolean);
    if (new Set(placed).size !== placed.length) {
      group.forEach((k) => errors.add(k));
    }
  }
  return errors;
};

/** ルール充足（全27線が3色1個ずつ） */
export const validateCube = (values) => validateByGroups(values, buildGroups3D());

/** 全マス埋まっているか */
export const isCubeFilled = (values) => isFilled(values, buildGroups3D());
