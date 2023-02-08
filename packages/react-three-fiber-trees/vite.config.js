import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        react(),
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/lib/index.js'),
            name: 'react-three-fiber-trees',
            formats: ['es', 'umd'],
            fileName: (format) => `react-three-fiber-trees.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'styled-components'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'styled-components': 'styled',
                },
            },
        },
    },
});