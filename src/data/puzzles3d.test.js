import { describe, it, expect } from 'vitest';
import cubePuzzles from './puzzles3d.js';
import {
  buildGroups3D,
  cubeToValues,
  validateCube,
  cubeBlanks,
  cubeErrorKeys,
} from '../utils/cube.js';
import { cellKey } from '../utils/validate.js';

// 3D ラテン立方をテスト内で独立に全列挙（生成器とは別経路で検証）
function latinSquares() {
  const perms = permutations([0, 1, 2]);
  const sqs = [];
  for (const r0 of perms)
    for (const r1 of perms)
      for (const r2 of perms) {
        const g = [r0, r1, r2];
        if ([0, 1, 2].every((c) => new Set([g[0][c], g[1][c], g[2][c]]).size === 3)) sqs.push(g);
      }
  return sqs;
}
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  arr.forEach((v, i) => {
    for (const p of permutations([...arr.slice(0, i), ...arr.slice(i + 1)])) out.push([v, ...p]);
  });
  return out;
}
function allCubes() {
  const LS = latinSquares();
  const cubes = [];
  for (const L0 of LS)
    for (const L1 of LS) {
      let ok = true;
      for (let r = 0; r < 3 && ok; r++) for (let c = 0; c < 3; c++) if (L0[r][c] === L1[r][c]) ok = false;
      if (!ok) continue;
      const L2 = [0, 1, 2].map((r) => [0, 1, 2].map((c) => 3 - L0[r][c] - L1[r][c]));
      const rowsOk = L2.every((row) => new Set(row).size === 3);
      const colsOk = [0, 1, 2].every((c) => new Set([L2[0][c], L2[1][c], L2[2][c]]).size === 3);
      if (rowsOk && colsOk) cubes.push([L0, L1, L2]);
    }
  return cubes;
}
const COLORS = ['red', 'yellow', 'blue'];
const cubeToColors = (cube) =>
  cube.map((layer) => layer.map((row) => row.map((i) => COLORS[i])));
const CUBES = allCubes().map(cubeToColors);

describe('3D パズルデータ', () => {
  it('6問ある', () => {
    expect(cubePuzzles).toHaveLength(6);
  });

  it('ラテン立方は全24種', () => {
    expect(CUBES).toHaveLength(24);
  });

  it('buildGroups3D は27本の線（各長さ3）', () => {
    const groups = buildGroups3D();
    expect(groups).toHaveLength(27);
    expect(groups.every((g) => g.length === 3)).toBe(true);
  });

  it('各セルはちょうど3本の線（行・列・柱）に属する', () => {
    const count = {};
    buildGroups3D().flat().forEach((k) => (count[k] = (count[k] ?? 0) + 1));
    expect(Object.keys(count)).toHaveLength(27);
    expect(Object.values(count).every((n) => n === 3)).toBe(true);
  });
});

describe.each(cubePuzzles)('3D id=$id (hints=$hints)', (p) => {
  it('answer がルール（27線3色）を満たす', () => {
    expect(validateCube(cubeToValues(p.answer))).toBe(true);
  });

  it('initial のヒントは answer と矛盾しない', () => {
    p.initial.forEach((layer, z) =>
      layer.forEach((row, r) =>
        row.forEach((color, c) => {
          if (color) expect(color).toBe(p.answer[z][r][c]);
        })
      )
    );
  });

  it('hints フィールドと実際のヒント数が一致', () => {
    const actual = p.initial.flat(2).filter(Boolean).length;
    expect(actual).toBe(p.hints);
  });

  it('唯一解である（合致するラテン立方がちょうど1つ）', () => {
    const hints = [];
    p.initial.forEach((layer, z) =>
      layer.forEach((row, r) =>
        row.forEach((color, c) => {
          if (color) hints.push([z, r, c, color]);
        })
      )
    );
    const matches = CUBES.filter((cube) =>
      hints.every(([z, r, c, color]) => cube[z][r][c] === color)
    );
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual(p.answer);
  });
});

describe('cubeErrorKeys / cubeBlanks', () => {
  it('正解状態はエラーなし', () => {
    const values = cubeToValues(cubePuzzles[0].answer);
    expect(cubeErrorKeys(values).size).toBe(0);
  });

  it('柱に同色を作るとその柱がエラーになる', () => {
    const values = cubeToValues(cubePuzzles[0].answer);
    // (0,0,0) と (1,0,0) を同じ色にして柱を壊す
    const k0 = cellKey(0, 0, 0);
    const k1 = cellKey(1, 0, 0);
    values[k1] = values[k0];
    const errs = cubeErrorKeys(values);
    expect(errs.has(k0)).toBe(true);
    expect(errs.has(k1)).toBe(true);
  });

  it('cubeBlanks は空きマス数を返す', () => {
    const p = cubePuzzles[0];
    expect(cubeBlanks(p.initial)).toBe(27 - p.hints);
  });
});
