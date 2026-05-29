import { describe, it, expect } from 'vitest';
import {
  formatTime,
  lineHasDuplicate,
  computeLineErrors,
  summarizeTimes,
  countBlanks,
  flagStage,
  verificationCode,
  MIN_PLAUSIBLE_SEC,
} from './play.js';
import { cellKey, gridToValues } from './validate.js';

describe('formatTime', () => {
  it('0秒は 00:00', () => expect(formatTime(0)).toBe('00:00'));
  it('65秒は 01:05', () => expect(formatTime(65)).toBe('01:05'));
  it('600秒は 10:00', () => expect(formatTime(600)).toBe('10:00'));
  it('小数は切り捨て', () => expect(formatTime(9.9)).toBe('00:09'));
  it('負やundefinedは 00:00', () => {
    expect(formatTime(-5)).toBe('00:00');
    expect(formatTime(undefined)).toBe('00:00');
  });
});

describe('lineHasDuplicate', () => {
  const values = { '0,0': 'red', '0,1': 'red', '0,2': 'blue' };
  it('同色が並ぶと true', () => {
    expect(lineHasDuplicate(values, [cellKey(0, 0), cellKey(0, 1), cellKey(0, 2)])).toBe(true);
  });
  it('空きを含む線でも、重複がなければ false', () => {
    expect(lineHasDuplicate({ '1,0': 'red' }, [cellKey(1, 0), cellKey(1, 1), cellKey(1, 2)])).toBe(false);
  });
});

describe('computeLineErrors', () => {
  it('正しい配置はエラーなし', () => {
    const v = gridToValues([
      ['red', 'yellow', 'blue'],
      ['yellow', 'blue', 'red'],
      ['blue', 'red', 'yellow'],
    ]);
    const { rows, cols } = computeLineErrors(v);
    expect(rows).toEqual([false, false, false]);
    expect(cols).toEqual([false, false, false]);
  });

  it('列に重複があるとその列だけ true', () => {
    // 列0 が red, yellow, red（重複）
    const v = gridToValues([
      ['red', 'yellow', 'blue'],
      ['yellow', 'blue', 'red'],
      ['red', 'blue', 'yellow'],
    ]);
    const { rows, cols } = computeLineErrors(v);
    expect(cols[0]).toBe(true);
    // 行2 は red, blue, yellow（重複なし）
    expect(rows[2]).toBe(false);
  });

  it('行に重複があるとその行だけ true', () => {
    const v = gridToValues([
      ['red', 'red', 'blue'],
      ['yellow', 'blue', 'red'],
      ['blue', 'yellow', 'yellow'],
    ]);
    const { rows } = computeLineErrors(v);
    expect(rows[0]).toBe(true);
    expect(rows[1]).toBe(false);
    expect(rows[2]).toBe(true);
  });
});

describe('summarizeTimes', () => {
  const puzzles = [
    { difficulty: 'easy' },
    { difficulty: 'easy' },
    { difficulty: 'medium' },
    { difficulty: 'hard' },
  ];

  it('未クリアは合計0・allDone=false', () => {
    const s = summarizeTimes({}, puzzles);
    expect(s.grandTotal).toBe(0);
    expect(s.doneCount).toBe(0);
    expect(s.allDone).toBe(false);
    expect(s.byDiff.easy).toEqual({ total: 0, done: 0, count: 2 });
  });

  it('難易度別と全体を正しく集計', () => {
    const times = { 0: 30, 1: 45, 2: 60 };
    const s = summarizeTimes(times, puzzles);
    expect(s.byDiff.easy).toEqual({ total: 75, done: 2, count: 2 });
    expect(s.byDiff.medium).toEqual({ total: 60, done: 1, count: 1 });
    expect(s.byDiff.hard).toEqual({ total: 0, done: 0, count: 1 });
    expect(s.grandTotal).toBe(135);
    expect(s.doneCount).toBe(3);
    expect(s.allDone).toBe(false);
  });

  it('全クリアで allDone=true', () => {
    const times = { 0: 10, 1: 10, 2: 10, 3: 10 };
    const s = summarizeTimes(times, puzzles);
    expect(s.allDone).toBe(true);
    expect(s.grandTotal).toBe(40);
  });
});

describe('countBlanks', () => {
  it('null マスの数を数える', () => {
    expect(
      countBlanks([
        ['red', 'yellow', null],
        [null, null, 'yellow'],
        ['blue', null, null],
      ])
    ).toBe(5); // ヒント4 → 空き5
  });
});

describe('flagStage（★2 チート抑止判定）', () => {
  it('十分な操作・下限以上の時間なら正常', () => {
    const f = flagStage({ sec: 30, placed: 5, blanks: 5, difficulty: 'easy' });
    expect(f.suspicious).toBe(false);
  });

  it('操作回数が空きマス未満なら tooFewMoves（盤面注入など）', () => {
    const f = flagStage({ sec: 30, placed: 2, blanks: 5, difficulty: 'easy' });
    expect(f.tooFewMoves).toBe(true);
    expect(f.suspicious).toBe(true);
  });

  it('下限秒数未満なら tooFast', () => {
    const f = flagStage({ sec: 1, placed: 7, blanks: 7, difficulty: 'hard' });
    expect(f.tooFast).toBe(true); // hard の下限は 5秒
    expect(f.suspicious).toBe(true);
  });

  it('難易度別の下限を境界で判定', () => {
    // ちょうど下限 = OK、下限-1 = NG
    expect(flagStage({ sec: MIN_PLAUSIBLE_SEC.medium, placed: 6, blanks: 6, difficulty: 'medium' }).tooFast).toBe(false);
    expect(flagStage({ sec: MIN_PLAUSIBLE_SEC.medium - 1, placed: 6, blanks: 6, difficulty: 'medium' }).tooFast).toBe(true);
  });

  it('0秒や負の時間は必ず tooFast', () => {
    expect(flagStage({ sec: 0, placed: 5, blanks: 5, difficulty: 'easy' }).tooFast).toBe(true);
  });
});

describe('verificationCode', () => {
  it('同じ記録なら同じコード（決定的）', () => {
    const t = { 0: 30, 1: 45 };
    expect(verificationCode(t)).toBe(verificationCode(t));
  });

  it('順序が違っても同じコード', () => {
    expect(verificationCode({ 0: 30, 1: 45 })).toBe(verificationCode({ 1: 45, 0: 30 }));
  });

  it('記録が変わるとコードも変わる', () => {
    expect(verificationCode({ 0: 30 })).not.toBe(verificationCode({ 0: 31 }));
  });

  it('改ざんフラグでコードが変わる', () => {
    const t = { 0: 30, 1: 45 };
    expect(verificationCode(t, { tampered: true })).not.toBe(verificationCode(t));
  });

  it('6文字の英数字コード', () => {
    expect(verificationCode({ 0: 30 })).toMatch(/^[0-9A-Z]{6}$/);
  });
});
