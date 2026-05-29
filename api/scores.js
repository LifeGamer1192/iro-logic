// Vercel サーバーレス関数：スコア（名前＋合計時間）の保存とランキング取得。
//   GET  /api/scores        … 上位ランキングを返す
//   POST /api/scores        … スコアを1件保存して最新ランキングを返す
import { addScore, topScores } from '../src/server/scoreStore.js';

const MAX_NAME = 12;

// 制御文字（コード0x20未満と0x7f）を除去し、前後空白を落として最大長で切る
const sanitizeName = (name) =>
  String(name)
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 0x20 && code !== 0x7f;
    })
    .join('')
    .trim()
    .slice(0, MAX_NAME);

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const scores = await topScores(20);
      return res.status(200).json({ scores });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const name = sanitizeName(body.name ?? '');
      const totalSec = Math.floor(Number(body.totalSec));
      const clears = Math.floor(Number(body.clears) || 0);

      if (!name || !Number.isFinite(totalSec) || totalSec <= 0) {
        return res.status(400).json({ error: 'invalid', message: '名前と有効な合計時間が必要です' });
      }
      // 全20ステージ未クリアは受け付けない（ランキングは全クリア記録のみ）
      if (clears < 20) {
        return res.status(400).json({ error: 'not-complete', message: '全20ステージのクリアが必要です' });
      }

      const entry = {
        name,
        totalSec,
        clears,
        code: typeof body.code === 'string' ? body.code.slice(0, 12) : '',
        at: Date.now(),
      };
      await addScore(entry);
      const scores = await topScores(20);
      return res.status(200).json({ ok: true, scores });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method-not-allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'server-error', message: String(e?.message || e) });
  }
}
