import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/types/**',
        'src/**/*.d.ts',
        'src/index.ts', // Entry point - tested via integration tests
      ],
      thresholds: {
        lines: 45,
        functions: 50,
        branches: 90,
        statements: 45,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
