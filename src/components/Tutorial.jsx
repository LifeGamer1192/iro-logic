// 初回ロード時の説明モーダル（仕様書§5）。
export default function Tutorial({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-[#222]">
        <h1 id="tutorial-title" className="text-[24px] font-bold text-center mb-4">
          いろロジック
        </h1>

        <div className="space-y-4 text-[18px] leading-relaxed">
          <p>
            たて・よこ の どのれつにも、
            <br />
            <span className="font-bold">あか・きいろ・あお</span> を
            <br />
            ちょうど 1つずつ おいてね。
          </p>

          {/* ルールの見本（色のテクスチャ付き見本マス） */}
          <div className="flex justify-center gap-2">
            <span className="iro-cell iro-red w-10 h-10 border-2 border-[#333] rounded" aria-label="あか" />
            <span className="iro-cell iro-yellow w-10 h-10 border-2 border-[#333] rounded" aria-label="きいろ" />
            <span className="iro-cell iro-blue w-10 h-10 border-2 border-[#333] rounded" aria-label="あお" />
          </div>

          <p>
            マスを えらんで、したの いろボタンを
            <br />
            タップ（クリック）して うめてね。
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full min-h-[52px] rounded-xl bg-blue-500 hover:bg-gray-800 text-white text-[18px] font-bold transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          わかった！
        </button>
      </div>
    </div>
  );
}
