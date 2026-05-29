import { describe, it, expect } from 'vitest';
import puzzles from './puzzles.js';
import { validateGrid, buildGroups2D, validateByGroups, gridToValues } from '../utils/validate.js';

const HINTS_BY_DIFF = { easy: 4, medium: 3, hard: 2 };

describe('パズルデータ全体', () => {
  it('20問ある', () => {
    expect(puzzles).toHaveLength(20);
  });

  it('難易度内訳が easy7 / medium7 / hard6', () => {
    const count = puzzles.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] ?? 0) + 1;
      return acc;
    }, {});
    expect(count).toEqual({ easy: 7, medium: 7, hard: 6 });
  });

  it('id が 1〜20 で重複なし', () => {
    const ids = puzzles.map((p) => p.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });
});

describe.each(puzzles)('id=$id ($difficulty)', (p) => {
  it('answer がルール（行・列に3色）を満たす', () => {
    expect(validateGrid(p.answer)).toBe(true);
  });

  it('initial のヒントは answer と矛盾しない（部分集合）', () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const v = p.initial[r][c];
        if (v) expect(v).toBe(p.answer[r][c]);
      }
    }
  });

  it('ヒント数が difficulty 規定どおり（hints フィールドと実数が一致）', () => {
    const actual = p.initial.flat().filter(Boolean).length;
    expect(actual).toBe(HINTS_BY_DIFF[p.difficulty]);
    expect(p.hints).toBe(HINTS_BY_DIFF[p.difficulty]);
  });

  it('唯一解である（ヒントに合致するラテン方陣がちょうど1つ）', () => {
    // 12個の3次ラテン方陣を全列挙し、ヒントに合致する解が1つだけであることを確認
    const groups = buildGroups2D();
    const colors = ['red', 'yellow', 'blue'];
    const squares = enumerateLatinSquares(colors);
    expect(squares).toHaveLength(12);

    const hintCells = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) if (p.initial[r][c]) hintCells.push([r, c, p.initial[r][c]]);

    const matches = squares.filter((sq) =>
      hintCells.every(([r, c, color]) => sq[r][c] === color)
    );
    expect(matches).toHaveLength(1);
    // 唯一解が answer と一致すること
    expect(matches[0]).toEqual(p.answer);
    // 念のため、その解はルールも満たす
    expect(validateByGroups(gridToValues(matches[0]), groups)).toBe(true);
  });
});

// 3次ラテン方陣を全列挙（テスト内で独立に実装し、生成器とは別経路で検証する）
function enumerateLatinSquares(colors) {
  const perms = permutations([0, 1, 2]);
  const squares = [];
  for (const r0 of perms)
    for (const r1 of perms)
      for (const r2 of perms) {
        const g = [r0, r1, r2];
        const colOk = [0, 1, 2].every((c) => new Set([g[0][c], g[1][c], g[2][c]]).size === 3);
        if (colOk) squares.push(g.map((row) => row.map((i) => colors[i])));
      }
  return squares;
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  arr.forEach((v, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([v, ...p]);
  });
  return out;
}
