import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    define: {
        'process.env': {},
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src/card.ts'),
            name: 'NanoleafEffectCard',
            fileName: () => 'nanoleaf-effect-card.js',
            formats: ['iife'],
        },
        outDir: '..',
        emptyOutDir: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                globals: {},
            },
        },
    },
});
