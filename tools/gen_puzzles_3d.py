# -*- coding: utf-8 -*-
"""いろロジック 3D（層スライス＝ラテン立方）パズル生成スクリプト

3×3×3 のラテン立方（軸に平行な27本の線がすべて3色を1個ずつ）を全列挙し、
各問のヒント配置が唯一解になることを検証して src/data/puzzles3d.js を生成する。

データ構造: cube[z][r][c]  (z=段, r=行, c=列)  値は色名 or None
色マッピング: 0='red', 1='yellow', 2='blue'
"""
import os
import random
from itertools import permutations

COLORS = ['red', 'yellow', 'blue']
CELLS = [(z, r, c) for z in range(3) for r in range(3) for c in range(3)]  # 27


def latin_squares():
    """3x3 ラテン方陣を全列挙(12個)"""
    sqs = []
    for rows in permutations(permutations(range(3)), 3):
        g = [list(r) for r in rows]
        if all(len({g[r][c] for r in range(3)}) == 3 for c in range(3)):
            sqs.append(g)
    return sqs


LS = latin_squares()


def all_cubes():
    """ラテン立方を全列挙。
    各段(L0,L1,L2)がラテン方陣で、柱(z方向)も3色1個ずつになる組合せ。
    """
    cubes = []
    for L0 in LS:
        for L1 in LS:
            # 柱が3色になるには L0 と L1 が全マスで異なる必要がある
            if any(L0[r][c] == L1[r][c] for r in range(3) for c in range(3)):
                continue
            # L2 は柱を埋めるよう一意に決まる (0+1+2=3)
            L2 = [[3 - L0[r][c] - L1[r][c] for c in range(3)] for r in range(3)]
            # L2 もラテン方陣であることを確認
            rows_ok = all(len({L2[r][c] for c in range(3)}) == 3 for r in range(3))
            cols_ok = all(len({L2[r][c] for r in range(3)}) == 3 for c in range(3))
            if rows_ok and cols_ok:
                cubes.append((L0, L1, L2))
    return cubes


CUBES = all_cubes()


def value(cube, z, r, c):
    return cube[z][r][c]


def unique_count(sol, cells):
    """ヒント配置に合致するラテン立方の数"""
    return sum(
        1 for cube in CUBES
        if all(value(cube, z, r, c) == value(sol, z, r, c) for (z, r, c) in cells)
    )


def minimal_hint_set(sol, seed):
    """全マスから貪欲に減らし、唯一解を保てる最小のヒント集合を作る"""
    cells = list(CELLS)
    random.Random(seed).shuffle(cells)
    keep = set(CELLS)
    for cell in cells:
        trial = keep - {cell}
        if unique_count(sol, trial) == 1:
            keep = trial
    return keep


def make_hint_set(sol, target_hints, seed):
    """最小集合を作り、target まで余分なヒントを足して難易度を調整する"""
    m = minimal_hint_set(sol, seed)
    if len(m) < target_hints:
        extra = [c for c in CELLS if c not in m]
        random.Random(seed + 1000).shuffle(extra)
        for c in extra[: target_hints - len(m)]:
            m.add(c)
    return m


# (解インデックス, 目標ヒント数) を分散。ヒントが多いほどやさしい。
PLAN = [
    (0, 16),
    (3, 15),
    (7, 14),
    (11, 13),
    (5, 12),
    (9, 11),
]


def to_grid3d(sol, cells=None):
    """cells が None なら answer、指定ありなら initial(ヒントのみ)"""
    return [
        [
            [
                COLORS[value(sol, z, r, c)]
                if (cells is None or (z, r, c) in cells)
                else None
                for c in range(3)
            ]
            for r in range(3)
        ]
        for z in range(3)
    ]


def build():
    puzzles = []
    for pid, (sol_idx, target) in enumerate(PLAN, start=1):
        sol = CUBES[sol_idx % len(CUBES)]
        cells = make_hint_set(sol, target, seed=pid * 31 + 7)
        assert unique_count(sol, cells) == 1, f"id={pid}: 唯一解でない"
        puzzles.append({
            'id': pid,
            'hints': len(cells),
            'initial': to_grid3d(sol, cells),
            'answer': to_grid3d(sol, None),
        })
    return puzzles


def fmt_layer(layer):
    rows = []
    for row in layer:
        items = ', '.join("null" if v is None else f"'{v}'" for v in row)
        rows.append(f"      [{items}]")
    return "[\n" + ",\n".join(rows) + ",\n    ]"


def fmt_cube(cube):
    layers = [fmt_layer(layer) for layer in cube]
    return "[\n    " + ",\n    ".join(layers) + ",\n  ]"


def emit_js(puzzles):
    lines = [
        "// いろロジック 3D（層スライス＝ラテン立方）パズルデータ",
        "// 自動生成: tools/gen_puzzles_3d.py",
        "// 構造: cube[z][r][c]  z=段(0..2), r=行, c=列  色: 'red'/'yellow'/'blue'",
        "// 全問 ラテン立方ベース・唯一解を検証済み（軸27本の線が各3色1個ずつ）",
        "",
        "export const cubePuzzles = [",
    ]
    for p in puzzles:
        lines.append("  {")
        lines.append(f"    id: {p['id']},")
        lines.append(f"    hints: {p['hints']},")
        lines.append(f"    initial: {fmt_cube(p['initial'])},")
        lines.append(f"    answer: {fmt_cube(p['answer'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export default cubePuzzles;")
    lines.append("")
    return "\n".join(lines)


def ascii_preview(puzzles):
    sym = {'red': 'R', 'yellow': 'Y', 'blue': 'B', None: '.'}
    out = []
    for p in puzzles:
        out.append(f"--- id={p['id']} hints={p['hints']} ---")
        for r in range(3):
            parts = []
            for z in range(3):
                ini = ' '.join(sym[p['initial'][z][r][c]] for c in range(3))
                parts.append(ini)
            out.append("  だん: " + "   |   ".join(parts))
    return "\n".join(out)


if __name__ == '__main__':
    print(f"ラテン方陣: {len(LS)} / ラテン立方(総数): {len(CUBES)}")
    puzzles = build()
    print(f"生成パズル数: {len(puzzles)}")
    print("全問 唯一解検証: OK")
    print()
    print(ascii_preview(puzzles))

    out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'puzzles3d.js')
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(emit_js(puzzles))
    print(f"\n書き出し: {os.path.normpath(out_path)}")
