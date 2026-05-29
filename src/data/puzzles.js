// いろロジック パズルデータ (自動生成: tools/gen_puzzles.py)
// 色: 'red'=赤, 'yellow'=黄, 'blue'=青
// 全問 3次ラテン方陣ベース・唯一解を検証済み
// easy: ヒント4個(7問) / medium: ヒント3個(7問) / hard: ヒント2個(6問)

export const puzzles = [
  {
    id: 1,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['red', 'yellow', 'blue'],
    [null, 'blue', null],
    [null, null, null],
  ],
    answer: [
    ['red', 'yellow', 'blue'],
    ['yellow', 'blue', 'red'],
    ['blue', 'red', 'yellow'],
  ],
  },
  {
    id: 2,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['red', 'yellow', 'blue'],
    [null, null, 'yellow'],
    [null, null, null],
  ],
    answer: [
    ['red', 'yellow', 'blue'],
    ['blue', 'red', 'yellow'],
    ['yellow', 'blue', 'red'],
  ],
  },
  {
    id: 3,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['red', 'blue', 'yellow'],
    [null, null, null],
    ['blue', null, null],
  ],
    answer: [
    ['red', 'blue', 'yellow'],
    ['yellow', 'red', 'blue'],
    ['blue', 'yellow', 'red'],
  ],
  },
  {
    id: 4,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['red', 'blue', 'yellow'],
    [null, null, null],
    [null, 'red', null],
  ],
    answer: [
    ['red', 'blue', 'yellow'],
    ['blue', 'yellow', 'red'],
    ['yellow', 'red', 'blue'],
  ],
  },
  {
    id: 5,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['yellow', 'red', 'blue'],
    [null, null, null],
    [null, null, 'red'],
  ],
    answer: [
    ['yellow', 'red', 'blue'],
    ['red', 'blue', 'yellow'],
    ['blue', 'yellow', 'red'],
  ],
  },
  {
    id: 6,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['yellow', 'red', null],
    ['blue', 'yellow', null],
    [null, null, null],
  ],
    answer: [
    ['yellow', 'red', 'blue'],
    ['blue', 'yellow', 'red'],
    ['red', 'blue', 'yellow'],
  ],
  },
  {
    id: 7,
    difficulty: 'easy',
    hints: 4,
    initial: [
    ['yellow', 'blue', null],
    ['red', null, 'blue'],
    [null, null, null],
  ],
    answer: [
    ['yellow', 'blue', 'red'],
    ['red', 'yellow', 'blue'],
    ['blue', 'red', 'yellow'],
  ],
  },
  {
    id: 8,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['yellow', null, 'red'],
    [null, null, 'yellow'],
    [null, null, null],
  ],
    answer: [
    ['yellow', 'blue', 'red'],
    ['blue', 'red', 'yellow'],
    ['red', 'yellow', 'blue'],
  ],
  },
  {
    id: 9,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['blue', null, 'yellow'],
    [null, null, null],
    ['yellow', null, null],
  ],
    answer: [
    ['blue', 'red', 'yellow'],
    ['red', 'yellow', 'blue'],
    ['yellow', 'blue', 'red'],
  ],
  },
  {
    id: 10,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['blue', null, 'yellow'],
    [null, null, null],
    [null, 'yellow', null],
  ],
    answer: [
    ['blue', 'red', 'yellow'],
    ['yellow', 'blue', 'red'],
    ['red', 'yellow', 'blue'],
  ],
  },
  {
    id: 11,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['blue', null, 'red'],
    [null, null, null],
    [null, null, 'blue'],
  ],
    answer: [
    ['blue', 'yellow', 'red'],
    ['red', 'blue', 'yellow'],
    ['yellow', 'red', 'blue'],
  ],
  },
  {
    id: 12,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['blue', null, null],
    ['yellow', 'red', null],
    [null, null, null],
  ],
    answer: [
    ['blue', 'yellow', 'red'],
    ['yellow', 'red', 'blue'],
    ['red', 'blue', 'yellow'],
  ],
  },
  {
    id: 13,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['red', null, null],
    ['yellow', null, 'red'],
    [null, null, null],
  ],
    answer: [
    ['red', 'yellow', 'blue'],
    ['yellow', 'blue', 'red'],
    ['blue', 'red', 'yellow'],
  ],
  },
  {
    id: 14,
    difficulty: 'medium',
    hints: 3,
    initial: [
    ['red', null, null],
    ['yellow', null, null],
    [null, 'yellow', null],
  ],
    answer: [
    ['red', 'blue', 'yellow'],
    ['yellow', 'red', 'blue'],
    ['blue', 'yellow', 'red'],
  ],
  },
  {
    id: 15,
    difficulty: 'hard',
    hints: 2,
    initial: [
    [null, null, null],
    ['blue', null, null],
    [null, null, 'red'],
  ],
    answer: [
    ['red', 'yellow', 'blue'],
    ['blue', 'red', 'yellow'],
    ['yellow', 'blue', 'red'],
  ],
  },
  {
    id: 16,
    difficulty: 'hard',
    hints: 2,
    initial: [
    [null, null, null],
    [null, 'yellow', null],
    [null, null, 'blue'],
  ],
    answer: [
    ['red', 'blue', 'yellow'],
    ['blue', 'yellow', 'red'],
    ['yellow', 'red', 'blue'],
  ],
  },
  {
    id: 17,
    difficulty: 'hard',
    hints: 2,
    initial: [
    [null, null, null],
    [null, null, 'red'],
    [null, 'blue', null],
  ],
    answer: [
    ['yellow', 'red', 'blue'],
    ['blue', 'yellow', 'red'],
    ['red', 'blue', 'yellow'],
  ],
  },
  {
    id: 18,
    difficulty: 'hard',
    hints: 2,
    initial: [
    ['yellow', null, null],
    [null, 'red', null],
    [null, null, null],
  ],
    answer: [
    ['yellow', 'blue', 'red'],
    ['blue', 'red', 'yellow'],
    ['red', 'yellow', 'blue'],
  ],
  },
  {
    id: 19,
    difficulty: 'hard',
    hints: 2,
    initial: [
    ['blue', null, null],
    [null, null, null],
    [null, 'yellow', null],
  ],
    answer: [
    ['blue', 'red', 'yellow'],
    ['yellow', 'blue', 'red'],
    ['red', 'yellow', 'blue'],
  ],
  },
  {
    id: 20,
    difficulty: 'hard',
    hints: 2,
    initial: [
    [null, 'yellow', null],
    [null, null, 'blue'],
    [null, null, null],
  ],
    answer: [
    ['blue', 'yellow', 'red'],
    ['yellow', 'red', 'blue'],
    ['red', 'blue', 'yellow'],
  ],
  },
];

export default puzzles;
