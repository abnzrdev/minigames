import { defineConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/minigames/' : '/',
  plugins: [
    {
      name: 'github-pages-spa-fallback',
      writeBundle(output) {
        if (output.dir) {
          copyFileSync(resolve(output.dir, 'index.html'), resolve(output.dir, '404.html'));
        }
      },
    },
  ],
});
