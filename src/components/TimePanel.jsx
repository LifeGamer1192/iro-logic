// タイム表示：今ステージの経過時間・各ステージ所要時間・各級合計・全体合計。
// 各ステージのタイムはクリックでそのステージへジャンプできる。
// 全体合計の近くにランキング表示ボタン、全クリア時は名前入力＋登録。
import { formatTime, summarizeTimes, verificationCode } from '../utils/play.js';

const DIFF_LABEL = { easy: 'しょきゅう', medium: 'ちゅうきゅう', hard: 'じょうきゅう' };

export default function TimePanel({
  puzzles,
  times,
  flags = {},
  currentIndex,
  currentElapsedSec,
  onJump,
  onOpenRanking,
  playerName,
  onNameChange,
  onSubmit,
  submitState, // { status: 'idle'|'sending'|'done'|'error', message }
}) {
  const summary = summarizeTimes(times, puzzles);
  const tampered = Object.values(flags).some((f) => f?.suspicious); // ★2：怪しい記録あり
  const code = verificationCode(times, { tampered });
  const canSubmit =
    summary.allDone && !tampered && (playerName || '').trim().length > 0 && submitState?.status !== 'sending';

  return (
    <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
      {/* 今ステージの経過時間 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[14px] font-bold text-gray-600">⏱ いまのステージ</span>
        <span className="text-[22px] font-bold tabular-nums">{formatTime(currentElapsedSec)}</span>
      </div>

      {/* 難易度ごとの所要時間＋各ステージのタイム（クリックでジャンプ） */}
      <div className="space-y-2 border-t border-gray-200 pt-2">
        {summary.order.map((diff) => {
          const d = summary.byDiff[diff];
          const stages = puzzles.map((p, i) => ({ p, i })).filter(({ p }) => p.difficulty === diff);
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
                  const susp = flags[i]?.suspicious;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onJump?.(i)}
                      className={
                        'text-[11px] px-1.5 py-0.5 rounded tabular-nums border cursor-pointer ' +
                        'hover:brightness-95 active:scale-95 transition ' +
                        'focus:outline-none focus:ring-2 focus:ring-blue-400 ' +
                        (susp
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : done
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-gray-50 border-gray-200 text-gray-500') +
                        (current ? ' ring-2 ring-blue-400' : '')
                      }
                      title={
                        susp ? 'はやすぎる／操作が少ない記録（記録対象外）' : `ステージ ${p.id} へいどう`
                      }
                    >
                      {p.id}: {done ? formatTime(times[i]) : '—'}
                      {susp ? ' ⚠️' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 全20ステージの合計 ＋ ランキング表示ボタン */}
      <div className="flex items-center justify-between border-t border-gray-200 mt-2 pt-2 gap-2">
        <span className="text-[15px] font-bold">
          ぜんぶの ごうけい（{summary.doneCount}/{summary.total}）
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-bold tabular-nums">{formatTime(summary.grandTotal)}</span>
          <button
            type="button"
            onClick={onOpenRanking}
            className="text-[13px] font-bold px-2 py-1 rounded-lg bg-blue-500 hover:bg-gray-800 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            🏆 ランキング
          </button>
        </span>
      </div>

      {/* 検証コード（改ざん照合用・★2）。1問でもクリアしたら表示 */}
      {summary.doneCount > 0 && (
        <p className="mt-1 text-[11px] text-gray-500 text-right">
          けんしょうコード: <span className="font-mono font-bold tracking-wider">{code}</span>
        </p>
      )}

      {/* 全クリア時：キャプチャ案内 ＋ 名前入力 ＋ ランキング登録 */}
      {summary.allDone && (
        <div className="mt-3 rounded-xl bg-amber-50 border-2 border-amber-300 p-3 text-center">
          <p className="text-[18px] font-bold text-amber-800">🎉 ぜんぶ クリア！</p>
          <p className="text-[26px] font-extrabold tabular-nums text-amber-900 my-1">
            ごうけい {formatTime(summary.grandTotal)}
          </p>
          {tampered && (
            <p className="text-[13px] font-bold text-red-600 mb-1">
              ⚠️ はやすぎる記録が あるため「認定なし」です
            </p>
          )}
          <p className="text-[13px] text-amber-800">
            けんしょうコード: <span className="font-mono font-bold tracking-wider">{code}</span>
          </p>
          <p className="text-[14px] font-bold text-amber-800 mt-1 mb-2">
            📸 このがめんを スクショして きろくしてね！
          </p>

          {/* 名前入力＋ランキング登録 */}
          <div className="flex flex-col gap-2 items-stretch">
            <input
              type="text"
              value={playerName || ''}
              onChange={(e) => onNameChange?.(e.target.value)}
              placeholder="なまえ（12もじまで）"
              maxLength={12}
              className="min-h-[44px] px-3 rounded-lg border-2 border-amber-300 text-[16px] text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="なまえ"
            />
            {!tampered ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white text-[16px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                {submitState?.status === 'sending'
                  ? 'とうろくちゅう…'
                  : submitState?.status === 'done'
                    ? '✅ とうろくしたよ！'
                    : '🏆 ランキングに のせる'}
              </button>
            ) : (
              <p className="text-[12px] text-red-600">認定なしの記録は ランキングに のせられません</p>
            )}
            {submitState?.status === 'error' && (
              <p className="text-[12px] text-red-600">{submitState.message || 'とうろくに しっぱいしました'}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
