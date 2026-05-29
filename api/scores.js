// Vercel サーバーレス関数：スコア保存とランキング取得（2D=classic / 3D=cube 別ボード）。
//   GET  /api/scores?board=classic|cube   … 上位ランキング
//   POST /api/scores  body:{board,name,totalSec,clears,code} … 保存して最新ランキングを返す
import { addScore, topScores } from '../src/server/scoreStore.js';

const MAX_NAME = 12;
const REQUIRED_CLEARS = { classic: 20, cube: 6 };

const normalizeBoard = (b) => (b === 'cube' ? 'cube' : 'classic');

// 制御文字（0x20未満と0x7f）を除去し、前後空白を落として最大長で切る
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
      const board = normalizeBoard(req.query?.board);
      const scores = await topScores(board, 20);
      return res.status(200).json({ board, scores });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const board = normalizeBoard(body.board);
      const name = sanitizeName(body.name ?? '');
      const totalSec = Math.floor(Number(body.totalSec));
      const clears = Math.floor(Number(body.clears) || 0);
      const required = REQUIRED_CLEARS[board];

      if (!name || !Number.isFinite(totalSec) || totalSec <= 0) {
        return res.status(400).json({ error: 'invalid', message: '名前と有効な合計時間が必要です' });
      }
      if (clears < required) {
        return res
          .status(400)
          .json({ error: 'not-complete', message: `全${required}ステージのクリアが必要です` });
      }

      const entry = {
        name,
        totalSec,
        clears,
        code: typeof body.code === 'string' ? body.code.slice(0, 12) : '',
        at: Date.now(),
      };
      await addScore(board, entry);
      const scores = await topScores(board, 20);
      return res.status(200).json({ ok: true, board, scores });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method-not-allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'server-error', message: String(e?.message || e) });
  }
}
