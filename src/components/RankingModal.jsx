// ランキング表示モーダル。
import { formatTime } from '../utils/play.js';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function RankingModal({ open, onClose, scores, loading, error, title = '🏆 ランキング' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ranking-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 text-[#222] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="ranking-title" className="text-[22px] font-bold text-center mb-3">
          {title}
        </h2>

        {loading && <p className="text-center text-gray-500 py-6">よみこみちゅう…</p>}

        {error && (
          <p className="text-center text-amber-700 py-6 text-[14px]">
            ランキングは じゅんびちゅうです。
            <br />
            （サーバーに つながりませんでした）
          </p>
        )}

        {!loading && !error && scores.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            まだ きろくが ありません。
            <br />
            ぜんぶ クリアして 1ばんのりを めざそう！
          </p>
        )}

        {!loading && !error && scores.length > 0 && (
          <ol className="space-y-1">
            {scores.map((s, i) => (
              <li
                key={`${s.name}-${s.at ?? i}`}
                className={
                  'flex items-center justify-between rounded-lg px-3 py-2 ' +
                  (i < 3 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50')
                }
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-6 text-center font-bold">{MEDAL[i] ?? i + 1}</span>
                  <span className="font-bold truncate">{s.name}</span>
                </span>
                <span className="tabular-nums font-bold">{formatTime(s.totalSec)}</span>
              </li>
            ))}
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full min-h-[50px] rounded-xl bg-blue-500 hover:bg-gray-800 text-white text-[16px] font-bold transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          とじる
        </button>
      </div>
    </div>
  );
}
