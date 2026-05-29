# -*- coding: utf-8 -*-
"""いろロジック パズル生成スクリプト

3次ラテン方陣(全12種)を列挙し、各問のヒント配置が
12種のうちちょうど1つにしか一致しない(=唯一解)ことを検証して
src/data/puzzles.js を生成する。

色マッピング: 0='red', 1='yellow', 2='blue'
"""
from itertools import permutations, combinations

COLORS = ['red', 'yellow', 'blue']
CELLS = [(r, c) for r in range(3) for c in range(3)]


def all_latin_squares():
    """3x3 ラテン方陣を全列挙(必ず12個)"""
    squares = []
    for rows in permutations(permutations(range(3)), 3):
        grid = [list(r) for r in rows]
        if all(len({grid[r][c] for r in range(3)}) == 3 for c in range(3)):
            squares.append(grid)
    return squares


SQUARES = all_latin_squares()


def matches(sq, solution, cells):
    return all(sq[r][c] == solution[r][c] for (r, c) in cells)


def unique_count(solution, cells):
    """このヒント配置に合致するラテン方陣の数"""
    return sum(1 for sq in SQUARES if matches(sq, solution, cells))


def find_hint_set(solution, k, pick_index):
    """k個のヒントで唯一解になる配置の中から pick_index 番目を選ぶ(配置の多様性確保)"""
    valid = [cells for cells in combinations(CELLS, k)
             if unique_count(solution, cells) == 1]
    if not valid:
        return None
    return valid[pick_index % len(valid)]


def to_initial(solution, cells):
    return [[COLORS[solution[r][c]] if (r, c) in cells else None
             for c in range(3)] for r in range(3)]


def to_answer(solution):
    return [[COLORS[solution[r][c]] for c in range(3)] for r in range(3)]


# 難易度ごとの (ラテン方陣インデックス, ヒント数) 割り当て
# パターンは難易度内でできるだけ重複しないよう分散
PLAN = (
    [('easy', i, 4) for i in [0, 1, 2, 3, 4, 5, 6]] +        # 7問 ヒント4
    [('medium', i, 3) for i in [7, 8, 9, 10, 11, 0, 2]] +    # 7問 ヒント3
    [('hard', i, 2) for i in [1, 3, 5, 7, 9, 11]]            # 6問 ヒント2
)


def build():
    puzzles = []
    for pid, (diff, sq_idx, k) in enumerate(PLAN, start=1):
        solution = SQUARES[sq_idx]
        cells = find_hint_set(solution, k, pick_index=pid)
        assert cells is not None, f"id={pid}: {k}ヒントで唯一解になる配置が見つからない"
        assert unique_count(solution, cells) == 1, f"id={pid}: 唯一解でない"
        puzzles.append({
            'id': pid,
            'difficulty': diff,
            'initial': to_initial(solution, cells),
            'answer': to_answer(solution),
            'hints': k,
        })
    return puzzles


def fmt_grid(grid):
    rows = []
    for row in grid:
        items = ', '.join("null" if v is None else f"'{v}'" for v in row)
        rows.append(f"    [{items}]")
    return "[\n" + ",\n".join(rows) + ",\n  ]"


def emit_js(puzzles):
    lines = [
        "// いろロジック パズルデータ (自動生成: tools/gen_puzzles.py)",
        "// 色: 'red'=赤, 'yellow'=黄, 'blue'=青",
        "// 全問 3次ラテン方陣ベース・唯一解を検証済み",
        "// easy: ヒント4個(7問) / medium: ヒント3個(7問) / hard: ヒント2個(6問)",
        "",
        "export const puzzles = [",
    ]
    for p in puzzles:
        lines.append("  {")
        lines.append(f"    id: {p['id']},")
        lines.append(f"    difficulty: '{p['difficulty']}',")
        lines.append(f"    hints: {p['hints']},")
        lines.append(f"    initial: {fmt_grid(p['initial'])},")
        lines.append(f"    answer: {fmt_grid(p['answer'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export default puzzles;")
    lines.append("")
    return "\n".join(lines)


def ascii_preview(puzzles):
    sym = {'red': 'R', 'yellow': 'Y', 'blue': 'B', None: '.'}
    out = []
    for p in puzzles:
        out.append(f"--- id={p['id']} [{p['difficulty']}] hints={p['hints']} ---")
        for r in range(3):
            ini = ' '.join(sym[p['initial'][r][c]] for c in range(3))
            ans = ' '.join(sym[p['answer'][r][c]] for c in range(3))
            out.append(f"  {ini}    |    {ans}")
    return "\n".join(out)


if __name__ == '__main__':
    assert len(SQUARES) == 12, f"ラテン方陣の数が異常: {len(SQUARES)}"
    puzzles = build()
    print(f"ラテン方陣 総数: {len(SQUARES)}")
    print(f"生成パズル数: {len(puzzles)} (easy/medium/hard = "
          f"{sum(1 for p in puzzles if p['difficulty']=='easy')}/"
          f"{sum(1 for p in puzzles if p['difficulty']=='medium')}/"
          f"{sum(1 for p in puzzles if p['difficulty']=='hard')})")
    print("全問 唯一解検証: OK")
    print()
    print(ascii_preview(puzzles))

    import os
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'puzzles.js')
    with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(emit_js(puzzles))
    print(f"\n書き出し: {os.path.normpath(out_path)}")
