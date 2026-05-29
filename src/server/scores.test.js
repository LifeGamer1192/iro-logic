import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../../api/scores.js';
import { __resetForTest } from './scoreStore.js';

// 環境変数なし＝インメモリのフォールバックで検証する
function mockRes() {
  const res = { statusCode: 200, body: null, headers: {} };
  res.status = (c) => {
    res.statusCode = c;
    return res;
  };
  res.json = (b) => {
    res.body = b;
    return res;
  };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
  };
  return res;
}

const fullClear = (name, totalSec) => ({
  method: 'POST',
  body: { name, totalSec, clears: 20, code: 'ABC123' },
});

describe('api/scores ハンドラ（インメモリ）', () => {
  beforeEach(() => __resetForTest());

  it('GET は空配列から始まる', async () => {
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.scores).toEqual([]);
  });

  it('全クリア記録をPOSTすると保存され、ランキングに載る', async () => {
    const res = mockRes();
    await handler(fullClear('たろう', 120), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.scores).toHaveLength(1);
    expect(res.body.scores[0]).toMatchObject({ name: 'たろう', totalSec: 120, clears: 20 });
  });

  it('速い順（昇順）に並ぶ', async () => {
    await handler(fullClear('おそい', 300), mockRes());
    await handler(fullClear('はやい', 100), mockRes());
    await handler(fullClear('ふつう', 200), mockRes());
    const res = mockRes();
    await handler({ method: 'GET' }, res);
    expect(res.body.scores.map((s) => s.name)).toEqual(['はやい', 'ふつう', 'おそい']);
  });

  it('名前が空白のみなら 400', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { name: '   ', totalSec: 100, clears: 20 } }, res);
    expect(res.statusCode).toBe(400);
  });

  it('合計時間が0以下なら 400', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'x', totalSec: 0, clears: 20 } }, res);
    expect(res.statusCode).toBe(400);
  });

  it('全20クリアしていなければ 400', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { name: 'x', totalSec: 100, clears: 5 } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('not-complete');
  });

  it('名前は前後空白をトリムし12文字に丸められる', async () => {
    const longName = '   ' + 'あいうえおかきくけこさしすせそ' + '   ';
    const res = mockRes();
    await handler(fullClear(longName, 100), res);
    const name = res.body.scores[0].name;
    expect(name.length).toBe(12);
    expect(name).toBe('あいうえおかきくけこさし');
  });

  it('GET/POST 以外は 405', async () => {
    const res = mockRes();
    await handler({ method: 'DELETE' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('cubeボード：全6クリアで保存でき、classicとは別管理', async () => {
    // cube は6クリアでOK
    const r1 = mockRes();
    await handler({ method: 'POST', body: { board: 'cube', name: 'きゅーぶ', totalSec: 300, clears: 6 } }, r1);
    expect(r1.statusCode).toBe(200);
    expect(r1.body.board).toBe('cube');

    // cube の GET には載るが classic には載らない
    const rc = mockRes();
    await handler({ method: 'GET', query: { board: 'cube' } }, rc);
    expect(rc.body.scores.map((s) => s.name)).toEqual(['きゅーぶ']);

    const rClassic = mockRes();
    await handler({ method: 'GET', query: { board: 'classic' } }, rClassic);
    expect(rClassic.body.scores).toEqual([]);
  });

  it('cubeボード：6未満のクリアは 400', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { board: 'cube', name: 'x', totalSec: 100, clears: 5 } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('not-complete');
  });

  it('classicボードは20クリア必須（cube基準ではない）', async () => {
    const res = mockRes();
    await handler({ method: 'POST', body: { board: 'classic', name: 'x', totalSec: 100, clears: 6 } }, res);
    expect(res.statusCode).toBe(400); // classic は6では不足
  });
});
