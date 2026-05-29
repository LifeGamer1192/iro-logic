// 3Dモードの詳しいルール説明ポップアップ。特に「はしら」を重点解説。
import MiniGrid from './MiniGrid.jsx';

const OK_LAYER = [
  ['red', 'yellow', 'blue'],
  ['yellow', 'blue', 'red'],
  ['blue', 'red', 'yellow'],
];

// 縦に積んだ「はしら」（1だん→2だん→3だんの同じ位置）の見本
function Pillar({ colors, badge, badgeCls, caption }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          {colors.map((color, z) => (
            <span key={z} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 w-9 text-right">{z + 1}だん</span>
              <span
                className={`iro-cell iro-${color} w-8 h-8 border-2 border-[#333]`}
                aria-hidden="true"
              />
            </span>
          ))}
        </div>
        <span className={`text-[13px] font-bold px-2 py-0.5 rounded ${badgeCls}`}>{badge}</span>
      </div>
      <figcaption className="text-[11px] text-gray-600 text-center">{caption}</figcaption>
    </figure>
  );
}

export default function CubeRuleModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cuberule-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 text-[#222] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cuberule-title" className="text-[20px] font-bold text-center mb-3">
          3Dルール（だんパズル）
        </h2>

        <p className="text-[14px] leading-relaxed mb-4">
          3まいの ばん（<b>1だん・2だん・3だん</b>）を つかいます。
          <span className="text-ironote-red font-bold">あか</span>・
          <span className="text-yellow-600 font-bold">きいろ</span>・
          <span className="text-ironote-blue font-bold">あお</span> を、つぎの <b>3つ</b> のルールで おきます。
        </p>

        {/* ルール1・2：各段の よこ・たて */}
        <div className="rounded-xl border border-gray-200 p-3 mb-3">
          <p className="text-[14px] font-bold mb-1">① ② 各段（ばん）の よこ と たて</p>
          <p className="text-[13px] text-gray-700 mb-2">
            どの ばんも、よこ1れつ・たて1れつ に 3色を 1つずつ（ふつうの いろロジックと おなじ）。
          </p>
          <div className="flex items-center gap-3">
            <MiniGrid grid={OK_LAYER} cell={22} />
            <span className="text-[13px] font-bold text-green-700">⭕ OK</span>
          </div>
        </div>

        {/* ルール3：はしら（重点解説） */}
        <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-3">
          <p className="text-[15px] font-bold text-purple-800 mb-1">③ はしら（いちばん だいじ！）</p>
          <p className="text-[13px] text-gray-800 leading-relaxed mb-3">
            <b>「はしら」</b>とは、3まいの ばんの <b>おなじ ばしょ</b> を
            <b> 上から下へ つらぬく たての3マス</b> のことです。
            <br />
            この <b>はしら にも</b>、
            <span className="text-ironote-red font-bold">あか</span>・
            <span className="text-yellow-600 font-bold">きいろ</span>・
            <span className="text-ironote-blue font-bold">あお</span> を 1つずつ おきます。
            <br />
            （1つの ばんの中ではなく、<b>ばんを またいで 上下</b> で見るのが ポイント！）
          </p>
          <div className="flex justify-center gap-6">
            <Pillar
              colors={['red', 'yellow', 'blue']}
              badge="⭕ OK"
              badgeCls="bg-green-100 text-green-700"
              caption="3色 そろってる"
            />
            <Pillar
              colors={['red', 'red', 'blue']}
              badge="❌ NG"
              badgeCls="bg-red-100 text-red-700"
              caption="1だんと2だんが おなじ あか！"
            />
          </div>
          <p className="text-[12px] text-purple-700 mt-3 text-center">
            💡 3Dの立方体を まわすと、はしら（たての並び）が 見やすいよ
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full min-h-[50px] rounded-xl bg-blue-500 hover:bg-gray-800 text-white text-[16px] font-bold transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          わかった！
        </button>
      </div>
    </div>
  );
}
