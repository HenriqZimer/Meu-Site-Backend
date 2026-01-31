import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'test/**',
        'cypress/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.cy.ts',
        '**/*.config.{js,ts,mjs}',
        '**/.eslintrc.js',
        '**/eslint.config.mjs',
        'src/main.ts',
        'src/app.module.ts',
        '**/*.module.ts',
        '**/*.dto.ts',
        '**/*.schema.ts',
        '**/*.interface.ts',
        '**/*.entity.ts',
      ],
      include: ['src/**/*.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
