import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts', // Tests verify application behavior; they are not application logic.
        'src/**/*.d.ts', // Type declarations have no executable application logic.
      ],
    },
  },
});
