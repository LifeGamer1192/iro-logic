// 3D立方体ビュー（CSS 3D変換・依存なし）。
// ドラッグでグリグリ回転。色の置き/消しは平面側で行い、values の変化が即時反映される（読み取り専用表示）。
import { useEffect, useRef, useState } from 'react';
import { cellKey, SIZE } from '../utils/validate.js';

const CELL = 42; // 1キューブレットの一辺(px)
const GAP = 8;
const STEP = CELL + GAP;

// 6面を持つ小さな立方体（色＋テクスチャ）。空きマスは半透明の白。
function Cubelet({ color, dim }) {
  const cls = color ? `iro-cell iro-${color}` : 'bg-white/70';
  const faceStyle = (transform) => ({
    position: 'absolute',
    width: CELL,
    height: CELL,
    border: '1px solid #333',
    transform,
    backfaceVisibility: 'hidden',
    opacity: dim && !color ? 0.5 : 1,
  });
  const h = CELL / 2;
  const faces = [
    `translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <div style={{ position: 'absolute', width: CELL, height: CELL, transformStyle: 'preserve-3d' }}>
      {faces.map((t, i) => (
        <div key={i} className={cls} style={faceStyle(t)} aria-hidden="true" />
      ))}
    </div>
  );
}

export default function CubeView({ values, size = SIZE }) {
  const [rot, setRot] = useState({ x: -22, y: -32 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // ドラッグ中は window 全体で move/up を拾う。
  // こうすると指が立方体の外やセルの上を通っても 1回のドラッグで連続回転できる
  //（スマホで pointer capture が切れて「1ミリずつ」しか動かない問題を解消）。
  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      if (e.cancelable) e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - last.current.x;
      const dy = y - last.current.y;
      last.current = { x, y };
      setRot((r) => ({ x: r.x - dy * 0.6, y: r.y + dx * 0.6 }));
    };
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    if (e.cancelable) e.preventDefault();
  };

  const idx = Array.from({ length: size }, (_, i) => i);
  const center = (size - 1) / 2;

  return (
    <div className="w-full flex flex-col items-center gap-1">
      <div
        className="relative cursor-grab active:cursor-grabbing select-none"
        style={{ width: 230, height: 230, perspective: '760px', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        role="img"
        aria-label="3D立方体（ドラッグでまわせる）"
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transformStyle: 'preserve-3d',
            transform: `translate(-50%, -50%) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          }}
        >
          {idx.flatMap((z) =>
            idx.flatMap((r) =>
              idx.map((c) => {
                const key = cellKey(z, r, c);
                const tx = (c - center) * STEP;
                const ty = (r - center) * STEP;
                const tz = -(z - center) * STEP; // z=0 を手前側に
                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute',
                      left: -CELL / 2,
                      top: -CELL / 2,
                      transformStyle: 'preserve-3d',
                      transform: `translate3d(${tx}px, ${ty}px, ${tz}px)`,
                    }}
                  >
                    <Cubelet color={values[key] ?? null} dim />
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
      <p className="text-[12px] text-gray-500">🖱️ ドラッグで グリグリ まわせます</p>
    </div>
  );
}
