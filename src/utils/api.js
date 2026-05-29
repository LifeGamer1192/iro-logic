// ランキングAPIのクライアント（board: 'classic'(2D) | 'cube'(3D)）。
const ENDPOINT = '/api/scores';

export async function fetchScores(board = 'classic') {
  const res = await fetch(`${ENDPOINT}?board=${encodeURIComponent(board)}`);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const data = await res.json();
  return data.scores ?? [];
}

export async function submitScore({ board = 'classic', name, totalSec, clears, code }) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, name, totalSec, clears, code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `submit failed: ${res.status}`);
  return data.scores ?? [];
}
