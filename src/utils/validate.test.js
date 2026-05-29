import { describe, it, expect } from 'vitest';
import {
  COLORS,
  cellKey,
  buildGroups2D,
  validateByGroups,
  isFilled,
  gridToValues,
  valuesToGrid,
  validateGrid,
} from './validate.js';

const SOLVED = [
  ['red', 'yellow', 'blue'],
  ['yellow', 'blue', 'red'],
  ['blue', 'red', 'yellow'],
];

describe('buildGroups2D', () => {
  it('行3本＋列3本＝6本の線を返す', () => {
    const groups = buildGroups2D();
    expect(groups).toHaveLength(6);
    expect(groups.every((g) => g.length === 3)).toBe(true);
  });

  it('各セルはちょうど2本の線（行と列）に属する', () => {
    const groups = buildGroups2D();
    const count = {};
    groups.flat().forEach((k) => (count[k] = (count[k] ?? 0) + 1));
    expect(Object.keys(count)).toHaveLength(9);
    expect(Object.values(count).every((n) => n === 2)).toBe(true);
  });
});

describe('validateGrid（2D配列・仕様書§7互換）', () => {
  it('正しいラテン方陣は true', () => {
    expect(validateGrid(SOLVED)).toBe(true);
  });

  it('未完成（null あり）は false', () => {
    const g = SOLVED.map((r) => [...r]);
    g[0][0] = null;
    expect(validateGrid(g)).toBe(false);
  });

  it('行に同色が重複すると false', () => {
    const g = [
      ['red', 'red', 'blue'],
      ['yellow', 'blue', 'red'],
      ['blue', 'yellow', 'yellow'],
    ];
    expect(validateGrid(g)).toBe(false);
  });

  it('列に同色が重複すると false', () => {
    const g = [
      ['red', 'yellow', 'blue'],
      ['red', 'blue', 'yellow'],
      ['blue', 'red', 'yellow'],
    ];
    expect(validateGrid(g)).toBe(false);
  });
});

describe('validateByGroups（汎用・次元非依存）', () => {
  const groups = buildGroups2D();

  it('Map でも plain object でも同じ結果', () => {
    const obj = gridToValues(SOLVED);
    const map = new Map(Object.entries(obj));
    expect(validateByGroups(obj, groups)).toBe(true);
    expect(validateByGroups(map, groups)).toBe(true);
  });

  it('任意の線リストを渡せる（3D版の前方互換）', () => {
    // 「柱」のような追加制約を1本足しても、満たさなければ false になる
    const obj = gridToValues(SOLVED);
    const extra = [...groups, [cellKey(0, 0), cellKey(0, 0), cellKey(0, 0)]];
    expect(validateByGroups(obj, extra)).toBe(false); // 同一セル3つ＝同色重複
  });
});

describe('isFilled', () => {
  const groups = buildGroups2D();
  it('全マス埋まっていれば true', () => {
    expect(isFilled(gridToValues(SOLVED), groups)).toBe(true);
  });
  it('1マスでも欠けると false', () => {
    const v = gridToValues(SOLVED);
    delete v[cellKey(1, 1)];
    expect(isFilled(v, groups)).toBe(false);
  });
});

describe('gridToValues / valuesToGrid のラウンドトリップ', () => {
  it('2D配列→マップ→2D配列で元に戻る', () => {
    expect(valuesToGrid(gridToValues(SOLVED))).toEqual(SOLVED);
  });
  it('null マスはマップに含めない', () => {
    const partial = [
      ['red', null, null],
      [null, null, 'yellow'],
      [null, 'red', null],
    ];
    const v = gridToValues(partial);
    expect(Object.keys(v)).toHaveLength(3);
    expect(valuesToGrid(v)).toEqual(partial);
  });
});

describe('COLORS', () => {
  it('赤・黄・青の3色', () => {
    expect(COLORS).toEqual(['red', 'yellow', 'blue']);
  });
});
