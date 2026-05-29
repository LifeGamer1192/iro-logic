// タイム表示：今ステージの経過時間・各ステージ所要時間・各級合計・全体合計。
import { formatTime, summarizeTimes } from '../utils/play.js';

const DIFF_LABEL = { easy: 'しょきゅう', medium: 'ちゅうきゅう', hard: 'じょうきゅう' };

export default function TimePanel({ puzzles, times, currentIndex, currentElapsedSec }) {
  const summary = summarizeTimes(times, puzzles);

  return (
    <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
      {/* 今ステージの経過時間 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[14px] font-bold text-gray-600">⏱ いまのステージ</span>
        <span className="text-[22px] font-bold tabular-nums">
          {formatTime(currentElapsedSec)}
        </span>
      </div>

      {/* 難易度ごとの所要時間＋各ステージのタイム */}
      <div className="space-y-2 border-t border-gray-200 pt-2">
        {summary.order.map((diff) => {
          const d = summary.byDiff[diff];
          const stages = puzzles
            .map((p, i) => ({ p, i }))
            .filter(({ p }) => p.difficulty === diff);
          return (
            <div key={diff}>
              <div className="flex items-center justify-between text-[13px] font-bold">
                <span>{DIFF_LABEL[diff]}（{d.done}/{d.count}）</span>
                <span className="tabular-nums">ごうけい {formatTime(d.total)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {stages.map(({ p, i }) => {
                  const done = times[i] != null;
                  const current = i === currentIndex;
                  return (
                    <span
                      key={p.id}
                      className={
                        'text-[11px] px-1.5 py-0.5 rounded tabular-nums border ' +
                        (done
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-gray-50 border-gray-200 text-gray-400') +
                        (current ? ' ring-2 ring-blue-400' : '')
                      }
                      title={`ステージ ${p.id}`}
                    >
                      {p.id}: {done ? formatTime(times[i]) : '—'}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 全20ステージの合計 */}
      <div className="flex items-center justify-between border-t border-gray-200 mt-2 pt-2 text-[15px] font-bold">
        <span>ぜんぶの ごうけい（{summary.doneCount}/{summary.total}）</span>
        <span className="tabular-nums">{formatTime(summary.grandTotal)}</span>
      </div>

      {/* 全クリア時：キャプチャ案内つきの合計表示 */}
      {summary.allDone && (
        <div className="mt-3 rounded-xl bg-amber-50 border-2 border-amber-300 p-3 text-center">
          <p className="text-[18px] font-bold text-amber-800">🎉 ぜんぶ クリア！</p>
          <p className="text-[26px] font-extrabold tabular-nums text-amber-900 my-1">
            ごうけい {formatTime(summary.grandTotal)}
          </p>
          <p className="text-[14px] font-bold text-amber-800">
            📸 このがめんを スクショして きろくしてね！
          </p>
        </div>
      )}
    </section>
  );
}
