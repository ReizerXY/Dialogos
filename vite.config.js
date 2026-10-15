import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        // Nunca exponer sourcemaps en produccion
        sourcemap: false,
        // Tamaño maximo de chunk antes de warning
        chunkSizeWarningLimit: 1000,
    },
    server: {
        // Ajustar si usas HTTPS local
        host: 'localhost',
    },
});