import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
export default [
  { ignores: ['node_modules/**', 'dist/**', '-P'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': hooks },
    rules: { 'no-undef': 'error', 'no-unreachable': 'error', 'react-hooks/rules-of-hooks': 'error' },
  },
];
