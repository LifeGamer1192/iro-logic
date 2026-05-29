// いろロジック 3D（層スライス＝ラテン立方）パズルデータ
// 自動生成: tools/gen_puzzles_3d.py
// 構造: cube[z][r][c]  z=段(0..2), r=行, c=列  色: 'red'/'yellow'/'blue'
// 全問 ラテン立方ベース・唯一解を検証済み（軸27本の線が各3色1個ずつ）

export const cubePuzzles = [
  {
    id: 1,
    hints: 16,
    initial: [
    [
      ['red', null, null],
      [null, null, 'red'],
      ['blue', null, null],
    ],
    [
      ['yellow', 'blue', null],
      ['blue', 'red', 'yellow'],
      [null, null, 'blue'],
    ],
    [
      ['blue', null, 'yellow'],
      ['red', 'yellow', 'blue'],
      ['yellow', 'blue', null],
    ],
  ],
    answer: [
    [
      ['red', 'yellow', 'blue'],
      ['yellow', 'blue', 'red'],
      ['blue', 'red', 'yellow'],
    ],
    [
      ['yellow', 'blue', 'red'],
      ['blue', 'red', 'yellow'],
      ['red', 'yellow', 'blue'],
    ],
    [
      ['blue', 'red', 'yellow'],
      ['red', 'yellow', 'blue'],
      ['yellow', 'blue', 'red'],
    ],
  ],
  },
  {
    id: 2,
    hints: 15,
    initial: [
    [
      ['red', 'yellow', 'blue'],
      ['blue', null, null],
      [null, null, 'red'],
    ],
    [
      [null, 'red', 'yellow'],
      ['yellow', null, 'red'],
      ['red', null, null],
    ],
    [
      [null, null, null],
      ['red', 'yellow', null],
      ['blue', 'red', 'yellow'],
    ],
  ],
    answer: [
    [
      ['red', 'yellow', 'blue'],
      ['blue', 'red', 'yellow'],
      ['yellow', 'blue', 'red'],
    ],
    [
      ['blue', 'red', 'yellow'],
      ['yellow', 'blue', 'red'],
      ['red', 'yellow', 'blue'],
    ],
    [
      ['yellow', 'blue', 'red'],
      ['red', 'yellow', 'blue'],
      ['blue', 'red', 'yellow'],
    ],
  ],
  },
  {
    id: 3,
    hints: 14,
    initial: [
    [
      [null, null, 'yellow'],
      [null, 'yellow', null],
      ['yellow', null, null],
    ],
    [
      [null, null, 'red'],
      ['yellow', 'red', 'blue'],
      [null, 'blue', 'yellow'],
    ],
    [
      [null, 'red', 'blue'],
      [null, 'blue', 'yellow'],
      [null, 'yellow', null],
    ],
  ],
    answer: [
    [
      ['red', 'blue', 'yellow'],
      ['blue', 'yellow', 'red'],
      ['yellow', 'red', 'blue'],
    ],
    [
      ['blue', 'yellow', 'red'],
      ['yellow', 'red', 'blue'],
      ['red', 'blue', 'yellow'],
    ],
    [
      ['yellow', 'red', 'blue'],
      ['red', 'blue', 'yellow'],
      ['blue', 'yellow', 'red'],
    ],
  ],
  },
  {
    id: 4,
    hints: 13,
    initial: [
    [
      [null, null, 'blue'],
      [null, 'yellow', 'red'],
      ['red', null, null],
    ],
    [
      ['blue', 'yellow', null],
      [null, null, null],
      ['yellow', 'red', 'blue'],
    ],
    [
      ['red', null, 'yellow'],
      [null, 'red', null],
      ['blue', null, null],
    ],
  ],
    answer: [
    [
      ['yellow', 'red', 'blue'],
      ['blue', 'yellow', 'red'],
      ['red', 'blue', 'yellow'],
    ],
    [
      ['blue', 'yellow', 'red'],
      ['red', 'blue', 'yellow'],
      ['yellow', 'red', 'blue'],
    ],
    [
      ['red', 'blue', 'yellow'],
      ['yellow', 'red', 'blue'],
      ['blue', 'yellow', 'red'],
    ],
  ],
  },
  {
    id: 5,
    hints: 12,
    initial: [
    [
      [null, 'blue', null],
      [null, null, 'blue'],
      [null, null, 'red'],
    ],
    [
      [null, null, 'red'],
      ['red', null, 'yellow'],
      [null, null, null],
    ],
    [
      ['yellow', null, 'blue'],
      [null, 'yellow', null],
      ['red', 'blue', 'yellow'],
    ],
  ],
    answer: [
    [
      ['red', 'blue', 'yellow'],
      ['yellow', 'red', 'blue'],
      ['blue', 'yellow', 'red'],
    ],
    [
      ['blue', 'yellow', 'red'],
      ['red', 'blue', 'yellow'],
      ['yellow', 'red', 'blue'],
    ],
    [
      ['yellow', 'red', 'blue'],
      ['blue', 'yellow', 'red'],
      ['red', 'blue', 'yellow'],
    ],
  ],
  },
  {
    id: 6,
    hints: 11,
    initial: [
    [
      [null, 'red', 'blue'],
      [null, 'blue', 'yellow'],
      ['blue', null, null],
    ],
    [
      ['blue', null, null],
      [null, null, 'blue'],
      ['red', 'blue', null],
    ],
    [
      [null, null, null],
      [null, null, null],
      ['yellow', null, 'blue'],
    ],
  ],
    answer: [
    [
      ['yellow', 'red', 'blue'],
      ['red', 'blue', 'yellow'],
      ['blue', 'yellow', 'red'],
    ],
    [
      ['blue', 'yellow', 'red'],
      ['yellow', 'red', 'blue'],
      ['red', 'blue', 'yellow'],
    ],
    [
      ['red', 'blue', 'yellow'],
      ['blue', 'yellow', 'red'],
      ['yellow', 'red', 'blue'],
    ],
  ],
  },
];

export default cubePuzzles;
