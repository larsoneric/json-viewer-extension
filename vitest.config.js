import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'generate-icons.html',
        'devtools.js', // Simple pass-through, not worth testing
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },
  },
});
