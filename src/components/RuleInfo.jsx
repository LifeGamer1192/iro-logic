// ルール説明＋OK例(1つ)・NG例(複数)。2Dモードのタイトル直下に表示。
import { cellKey } from '../utils/validate.js';
import MiniGrid from './MiniGrid.jsx';

const OK_GRID = [
  ['red', 'yellow', 'blue'],
  ['yellow', 'blue', 'red'],
  ['blue', 'red', 'yellow'],
];

// NG① よこ（行）に あか が2つ
const NG_ROW = [
  ['red', 'red', 'blue'],
  ['yellow', 'blue', 'red'],
  ['blue', 'yellow', 'yellow'],
];
const NG_ROW_KEYS = new Set([cellKey(0, 0), cellKey(0, 1)]);

// NG② たて（列）に あか が2つ
const NG_COL = [
  ['red', 'yellow', 'blue'],
  ['red', 'blue', 'yellow'],
  ['blue', 'red', 'yellow'],
];
const NG_COL_KEYS = new Set([cellKey(0, 0), cellKey(1, 0)]);

// NG③ よこ と たて の りょうほうに だぶりがある
const NG_BOTH = [
  ['yellow', 'yellow', 'blue'],
  ['blue', 'red', 'yellow'],
  ['blue', 'red', 'red'],
];
const NG_BOTH_KEYS = new Set([cellKey(0, 0), cellKey(0, 1), cellKey(1, 2), cellKey(2, 2)]);

function Example({ caption, grid, errorKeys, ok }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <figcaption className={`text-[12px] font-bold ${ok ? 'text-green-700' : 'text-red-700'}`}>
        {ok ? '⭕ OK' : '❌ NG'}
      </figcaption>
      <MiniGrid grid={grid} errorKeys={errorKeys} cell={22} />
      <span className="text-[10.5px] text-gray-600 text-center leading-tight w-[78px]">{caption}</span>
    </figure>
  );
}

export default function RuleInfo() {
  return (
    <section className="w-full rounded-xl bg-white border border-gray-200 p-3 text-[#222]">
      <p className="text-[15px] font-bold leading-snug mb-1">あそびかた</p>
      <p className="text-[13px] leading-relaxed text-gray-800 mb-3">
        マスを タップ（クリック）して えらび、したの いろボタンで うめます。
        <br />
        <b>よこ1れつ</b> と <b>たて1れつ</b> の どちらにも、
        <span className="text-ironote-red font-bold">あか</span>・
        <span className="text-yellow-600 font-bold">きいろ</span>・
        <span className="text-ironote-blue font-bold">あお</span> を
        <b>ちょうど 1つずつ</b>。
        <br />
        おなじ いろが <b>よこ や たて で 2つ いじょう</b> ならんだら ダメ（NG）です。
      </p>

      <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-2">
        <Example ok grid={OK_GRID} caption="よこ・たて 3色そろい" />
        <Example grid={NG_ROW} errorKeys={NG_ROW_KEYS} caption="よこ に あか2つ" />
        <Example grid={NG_COL} errorKeys={NG_COL_KEYS} caption="たて に あか2つ" />
        <Example grid={NG_BOTH} errorKeys={NG_BOTH_KEYS} caption="よこ も たて も だぶり" />
      </div>
    </section>
  );
}
