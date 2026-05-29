/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // 仕様書§6 のブレークポイント（base=スマホ小 320〜480px）
    screens: {
      tab: '481px', // タブレット 481〜768px
      pc: '769px', // PC 769〜1200px
      xl: '1201px', // 大型PC 1201px〜
    },
    extend: {
      colors: {
        ironote: {
          red: '#FF0000',
          yellow: '#FFD700',
          blue: '#0066FF',
        },
      },
    },
  },
  plugins: [],
};
