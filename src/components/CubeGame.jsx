// 3D（層スライス＝ラテン立方）モードのゲーム本体。
// 3×3×3 を3段の展開図で編集し、回転する3D立方体に即時反映。
// タイム計測と「3D独立ランキング」も備える。
import { useEffect, useMemo, useState } from 'react';
import cubePuzzles from '../data/puzzles3d.js';
import ColorButtons from './ColorButtons.jsx';
import CubeView from './CubeView.jsx';
import CubeRuleModal from './CubeRuleModal.jsx';
import RankingModal from './RankingModal.jsx';
import {
  cubeToValues,
  cubeHintKeys,
  cubeErrorKeys,
  validateCube,
  isCubeFilled,
  cubeBlanks,
  SIZE3,
} from '../utils/cube.js';
import { cellKey } from '../utils/validate.js';
import { formatTime, verificationCode, flagStage } from '../utils/play.js';
import { fetchScores, submitScore } from '../utils/api.js';

const NAME_KEY = 'iro-logic:player-name';
const TOTAL = cubePuzzles.length;
const COLOR_LABEL = { red: 'あか', yellow: 'きいろ', blue: 'あお' };

const monoNow = () =>
  typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

function CubeCell({ color, isHint, isSelected, isError, onSelect }) {
  const border = isSelected
    ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.5)] z-10'
    : isError
      ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.45)] z-10'
      : 'border-[#333]';
  return (
    <button
      type="button"
      onClick={isHint ? undefined : onSelect}
      disabled={isHint}
      aria-label={color ? `${COLOR_LABEL[color]}${isHint ? '（ヒント）' : ''}` : 'からのマス'}
      aria-pressed={isSelected}
      className={
        'flex items-center justify-center w-14 h-14 pc:w-16 pc:h-16 border-2 box-border ' +
        (color ? `iro-cell iro-${color}` : 'bg-white') +
        ' ' +
        border +
        (isHint ? ' cursor-default' : ' cursor-pointer')
      }
    >
      {isHint && <span className="text-sm opacity-70" aria-hidden="true">🔒</span>}
    </button>
  );
}

function Layer({ z, values, hintKeys, errorKeys, selected, onSelectCell }) {
  const idx = Array.from({ length: SIZE3 }, (_, i) => i);
  return (
    <figure className="flex flex-col items-center gap-1">
      <figcaption className="text-[13px] font-bold text-gray-600">{z + 1}だんめ</figcaption>
      <div className="inline-grid bg-[#333]" style={{ gridTemplateColumns: `repeat(${SIZE3}, max-content)` }}>
        {idx.map((r) =>
          idx.map((c) => {
            const key = cellKey(z, r, c);
            return (
              <CubeCell
                key={key}
                color={values[key] ?? null}
                isHint={hintKeys.has(key)}
                isSelected={selected === key}
                isError={errorKeys.has(key)}
                onSelect={() => onSelectCell(key)}
              />
            );
          })
        )}
      </div>
    </figure>
  );
}

export default function CubeGame() {
  const [index, setIndex] = useState(0);
  const puzzle = cubePuzzles[index];

  const [values, setValues] = useState(() => cubeToValues(puzzle.initial));
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showRules, setShowRules] = useState(false);

  // タイム計測（performance.now ベース）＆チート抑止
  const [times, setTimes] = useState({});
  const [flags, setFlags] = useState({});
  const [placeCount, setPlaceCount] = useState(0);
  const [stageStartAt, setStageStartAt] = useState(() => monoNow());
  const [now, setNow] = useState(() => monoNow());

  // ランキング
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [rankingOpen, setRankingOpen] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rankingState, setRankingState] = useState({ status: 'idle' });
  const [submitState, setSubmitState] = useState({ status: 'idle' });

  const hintKeys = useMemo(() => cubeHintKeys(puzzle.initial), [puzzle]);
  const errorKeys = useMemo(() => cubeErrorKeys(values), [values]);
  const hasError = errorKeys.size > 0;

  const doneCount = Object.keys(times).length;
  const grandTotal = Object.values(times).reduce((a, b) => a + b, 0);
  const allDone = doneCount === TOTAL;
  const tampered = Object.values(flags).some((f) => f?.suspicious);
  const code = verificationCode(times, { tampered });
  const currentElapsedSec =
    times[index] != null ? times[index] : Math.floor((now - stageStartAt) / 1000);

  useEffect(() => {
    const id = setInterval(() => setNow(monoNow()), 1000);
    return () => clearInterval(id);
  }, []);

  const load = (i) => {
    setIndex(i);
    setValues(cubeToValues(cubePuzzles[i].initial));
    setSelected(null);
    setResult(null);
    setPlaceCount(0);
    const t = monoNow();
    setStageStartAt(t);
    setNow(t);
  };

  const handleSelect = (key) => setSelected((prev) => (prev === key ? null : key));

  const handlePick = (color) => {
    if (!selected) return;
    setValues((prev) => ({ ...prev, [selected]: color }));
    setPlaceCount((n) => n + 1);
    setResult(null);
  };

  const handleCheck = () => {
    if (!isCubeFilled(values)) {
      setResult('incomplete');
      return;
    }
    const ok = validateCube(values);
    setResult(ok ? 'correct' : 'wrong');
    if (ok && times[index] == null) {
      const sec = Math.floor((monoNow() - stageStartAt) / 1000);
      // 3Dは難易度相当を 'hard'（下限5秒）として判定
      const flag = flagStage({ sec, placed: placeCount, blanks: cubeBlanks(puzzle.initial), difficulty: 'hard' });
      setTimes((prev) => ({ ...prev, [index]: sec }));
      setFlags((prev) => ({ ...prev, [index]: flag }));
    }
  };

  const handleReset = () => {
    setValues(cubeToValues(puzzle.initial));
    setSelected(null);
    setResult(null);
    setPlaceCount(0);
    setTimes((prev) => {
      const n = { ...prev };
      delete n[index];
      return n;
    });
    setFlags((prev) => {
      const n = { ...prev };
      delete n[index];
      return n;
    });
    const t = monoNow();
    setStageStartAt(t);
    setNow(t);
  };

  const handleNameChange = (name) => {
    setPlayerName(name);
    localStorage.setItem(NAME_KEY, name);
  };

  const openRanking = async () => {
    setRankingOpen(true);
    setRankingState({ status: 'loading' });
    try {
      const scores = await fetchScores('cube');
      setRanking(scores);
      setRankingState({ status: 'done' });
    } catch (e) {
      setRankingState({ status: 'error', message: String(e?.message || e) });
    }
  };

  const handleSubmit = async () => {
    if (!allDone || tampered || !playerName.trim()) return;
    setSubmitState({ status: 'sending' });
    try {
      const scores = await submitScore({
        board: 'cube',
        name: playerName.trim(),
        totalSec: grandTotal,
        clears: doneCount,
        code: verificationCode(times),
      });
      setRanking(scores);
      setSubmitState({ status: 'done' });
      setRankingState({ status: 'done' });
      setRankingOpen(true);
    } catch (e) {
      setSubmitState({ status: 'error', message: String(e?.message || e) });
    }
  };

  const message = {
    correct: { text: 'せいかい！すごい！ 🎉', cls: 'bg-green-100 text-green-800 border-green-400' },
    wrong: { text: 'もういちど かんがえてね 🤔', cls: 'bg-amber-100 text-amber-800 border-amber-400' },
    incomplete: { text: 'ぜんぶ いろを おいてね ✏️', cls: 'bg-sky-100 text-sky-800 border-sky-400' },
  }[result];

  const btn =
    'min-h-[50px] px-3 rounded-xl font-bold text-[16px] transition-colors cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-blue-300';

  const canSubmit = allDone && !tampered && playerName.trim().length > 0 && submitState.status !== 'sending';

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* ルール説明（3D版）＋詳しい説明ボタン */}
      <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[14px] font-bold leading-snug">
            3Dルール：<span className="text-ironote-red">あか</span>・
            <span className="text-yellow-600">きいろ</span>・
            <span className="text-ironote-blue">あお</span> を、
            <br />
            ① 各段の よこ に 1つずつ
            <br />
            ② 各段の たて に 1つずつ
            <br />③{' '}
            <b className="text-purple-700">
              「はしら」（3つの段の おなじ場所を 上下に つらぬく たての3マス）
            </b>{' '}
            にも 1つずつ
          </p>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="shrink-0 text-[12px] font-bold px-2 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            ❓ くわしく
          </button>
        </div>
      </section>

      {/* 3D立方体ビュー（ドラッグで回転・平面の編集が即時反映） */}
      <CubeView values={values} />

      {/* 3段の層スライス（ここで色を置く） */}
      <div className="flex flex-row flex-wrap justify-center gap-4">
        {Array.from({ length: SIZE3 }, (_, z) => (
          <Layer
            key={z}
            z={z}
            values={values}
            hintKeys={hintKeys}
            errorKeys={errorKeys}
            selected={selected}
            onSelectCell={handleSelect}
          />
        ))}
      </div>

      {hasError && (
        <p className="text-red-600 font-bold text-[14px] text-center">
          ⚠️ おなじ いろが ならんでいる れつ／はしら が あるよ
        </p>
      )}

      <p className="text-[14px] text-gray-600 min-h-[20px]">
        {selected ? 'いろボタンで うめてね' : 'マスを えらんでね'}
      </p>

      <ColorButtons onPick={handlePick} disabled={!selected} />

      <div
        className={
          'w-full min-h-[48px] flex items-center justify-center rounded-xl border-2 text-[17px] font-bold text-center px-2 ' +
          (message ? message.cls : 'border-transparent text-transparent')
        }
        role="status"
        aria-live="polite"
      >
        {message ? message.text : '　'}
      </div>

      <div className="w-full flex items-center justify-between text-[18px] font-bold text-[#222]">
        <span>{index + 1} / {TOTAL}</span>
        <span className="text-[13px] px-2 py-1 rounded-full bg-purple-100 text-purple-700">
          3D・じょうきゅう（ヒント{puzzle.hints}）
        </span>
      </div>

      <button type="button" onClick={handleCheck} className={`${btn} w-full bg-blue-500 hover:bg-gray-800 text-white text-[18px]`}>
        ✅ かくにん
      </button>

      <div className="w-full grid grid-cols-3 gap-2">
        <button type="button" onClick={() => index > 0 && load(index - 1)} disabled={index === 0} className={`${btn} bg-gray-200 hover:bg-gray-300 text-[#222]`}>
          ◀ まえ
        </button>
        <button type="button" onClick={handleReset} className={`${btn} bg-gray-200 hover:bg-gray-300 text-[#222]`}>
          ↺ やりなおす
        </button>
        <button
          type="button"
          onClick={() => index < TOTAL - 1 && load(index + 1)}
          disabled={index >= TOTAL - 1}
          className={`${btn} text-white ${result === 'correct' ? 'bg-green-500 hover:bg-green-600 animate-pulse' : 'bg-blue-500 hover:bg-gray-800'}`}
        >
          つぎ ▶
        </button>
      </div>

      {/* タイム＆3D独立ランキング */}
      <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-bold text-gray-600">⏱ いまのステージ</span>
          <span className="text-[22px] font-bold tabular-nums">{formatTime(currentElapsedSec)}</span>
        </div>

        {/* 各ステージのタイム（クリックでジャンプ） */}
        <div className="flex flex-wrap gap-1 border-t border-gray-200 pt-2">
          {cubePuzzles.map((p, i) => {
            const done = times[i] != null;
            const susp = flags[i]?.suspicious;
            const current = i === index;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => load(i)}
                className={
                  'text-[11px] px-1.5 py-0.5 rounded tabular-nums border cursor-pointer hover:brightness-95 transition ' +
                  (susp
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : done
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500') +
                  (current ? ' ring-2 ring-blue-400' : '')
                }
              >
                {p.id}: {done ? formatTime(times[i]) : '—'}
                {susp ? ' ⚠️' : ''}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 mt-2 pt-2 gap-2">
          <span className="text-[15px] font-bold">ぜんぶの ごうけい（{doneCount}/{TOTAL}）</span>
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-bold tabular-nums">{formatTime(grandTotal)}</span>
            <button
              type="button"
              onClick={openRanking}
              className="text-[13px] font-bold px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-800 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              🏆 3Dランキング
            </button>
          </span>
        </div>

        {doneCount > 0 && (
          <p className="mt-1 text-[11px] text-gray-500 text-right">
            けんしょうコード: <span className="font-mono font-bold tracking-wider">{code}</span>
          </p>
        )}

        {allDone && (
          <div className="mt-3 rounded-xl bg-purple-50 border-2 border-purple-300 p-3 text-center">
            <p className="text-[18px] font-bold text-purple-800">🎉 3D ぜんぶ クリア！</p>
            <p className="text-[26px] font-extrabold tabular-nums text-purple-900 my-1">
              ごうけい {formatTime(grandTotal)}
            </p>
            {tampered && (
              <p className="text-[13px] font-bold text-red-600 mb-1">
                ⚠️ はやすぎる記録が あるため「認定なし」です
              </p>
            )}
            <p className="text-[14px] font-bold text-purple-800 mb-2">📸 スクショして きろくしてね！</p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="なまえ（12もじまで）"
                maxLength={12}
                className="min-h-[44px] px-3 rounded-lg border-2 border-purple-300 text-[16px] text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                aria-label="なまえ"
              />
              {!tampered ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white text-[16px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  {submitState.status === 'sending'
                    ? 'とうろくちゅう…'
                    : submitState.status === 'done'
                      ? '✅ とうろくしたよ！'
                      : '🏆 3Dランキングに のせる'}
                </button>
              ) : (
                <p className="text-[12px] text-red-600">認定なしの記録は ランキングに のせられません</p>
              )}
              {submitState.status === 'error' && (
                <p className="text-[12px] text-red-600">{submitState.message || 'とうろくに しっぱいしました'}</p>
              )}
            </div>
          </div>
        )}
      </section>

      <CubeRuleModal open={showRules} onClose={() => setShowRules(false)} />
      <RankingModal
        open={rankingOpen}
        onClose={() => setRankingOpen(false)}
        scores={ranking}
        loading={rankingState.status === 'loading'}
        error={rankingState.status === 'error'}
        title="🏆 3Dランキング"
      />
    </div>
  );
}
