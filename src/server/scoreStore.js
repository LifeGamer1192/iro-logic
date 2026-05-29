// スコア保管の抽象化レイヤー。
// 環境変数が設定されていれば Upstash Redis（=Vercel KV）に永続保存、
// なければインメモリ（一時・非永続）にフォールバックする。
//
// 必要な環境変数（Vercel ダッシュボードで Upstash/KV を接続すると自動注入される）:
//   KV_REST_API_URL / KV_REST_API_TOKEN  または
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN

const KEY = 'iro-logic:scores';
const mem = []; // フォールバック用（関数インスタンス内のみ・非永続）

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

/** スコアを1件保存する（totalSec をスコアとした昇順ソート＝速いほど上位） */
export async function addScore(entry) {
  const redisP = getRedis();
  if (redisP) {
    const redis = await redisP;
    await redis.zadd(KEY, { score: entry.totalSec, member: JSON.stringify(entry) });
    return;
  }
  mem.push(entry);
}

/** 上位 n 件を所要時間の短い順に返す */
export async function topScores(n = 20) {
  const redisP = getRedis();
  if (redisP) {
    const redis = await redisP;
    const raw = await redis.zrange(KEY, 0, n - 1); // 昇順（速い順）
    return raw.map((r) => (typeof r === 'string' ? JSON.parse(r) : r));
  }
  return [...mem].sort((a, b) => a.totalSec - b.totalSec).slice(0, n);
}

/** テスト用：インメモリをクリア */
export function __resetForTest() {
  mem.length = 0;
}
