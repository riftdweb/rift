import multi from '@rollup/plugin-multi-entry'

export default {
  input: [
    'src/components/index.ts',
    'src/config/index.ts',
    'src/contexts/index.ts',
    'src/hooks/index.ts',
    'src/services/index.ts',
    'src/shared/index.ts',
  ],
  output: {
    dir: 'output',
  },
  plugins: [multi()],
}
