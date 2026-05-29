// スコア保管の抽象化レイヤー（2D=classic / 3D=cube の別ボード）。
// 環境変数があれば Upstash Redis（=Vercel KV）に永続保存、なければインメモリ（一時）。
//
// 必要な環境変数（Vercel で Upstash/KV を接続すると自動注入）:
//   KV_REST_API_URL / KV_REST_API_TOKEN  または
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN

const KEYS = {
  classic: 'iro-logic:scores',
  cube: 'iro-logic:scores:cube',
};
const keyOf = (board) => KEYS[board] || KEYS.classic;

const mem = {}; // フォールバック用 { key: [entry,...] }（非永続）
const memArr = (key) => (mem[key] || (mem[key] = []));

let redisPromise = null;
function getRedis() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!redisPromise) {
    redisPromise = import('@upstash/redis').then(({ Redis }) => new Redis({ url, token }));
  }
  return redisPromise;
}

/** スコアを1件保存（totalSec をスコアにした昇順＝速いほど上位） */
export async function addScore(board, entry) {
  const key = keyOf(board);
  const redisP = getRedis();
  if (redisP) {
    const redis = await redisP;
    await redis.zadd(key, { score: entry.totalSec, member: JSON.stringify(entry) });
    return;
  }
  memArr(key).push(entry);
}

/** 上位 n 件を所要時間の短い順に返す */
export async function topScores(board, n = 20) {
  const key = keyOf(board);
  const redisP = getRedis();
  if (redisP) {
    const redis = await redisP;
    const raw = await redis.zrange(key, 0, n - 1);
    return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
  }
  return [...memArr(key)].sort((a, b) => a.totalSec - b.totalSec).slice(0, n);
}

/** テスト用：全ボードのインメモリをクリア */
export function __resetForTest() {
  for (const k of Object.keys(mem)) delete mem[k];
}
