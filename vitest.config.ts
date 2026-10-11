import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: [['text', { skipFull: false, maxCols: 140 }], 'html', 'json-summary'],
      // Aggregate statements across all application files; individual files may remain below 80%.
      thresholds: { statements: 80 },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts', // Tests verify application behavior; they are not application logic.
        'src/**/*.d.ts', // Type declarations have no executable application logic.
      ],
    },
  },
});
