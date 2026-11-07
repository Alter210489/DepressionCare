import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// HAPUS BARIS INI:
// import { initializeTheme } from './hooks/use-appearance';

// Hardcode appName
const appName = 'DepressionCare';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        // Load semua file tsx di dalam pages
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });

        // Coba berbagai kemungkinan path
        const possiblePaths = [
            `./pages/${name}.tsx`,
            `./pages/${name}/Index.tsx`,
            `./pages/${name.replace(/\./g, '/')}.tsx`,
            `./pages/${name.replace(/\./g, '/')}/Index.tsx`
        ];

        // Cek setiap kemungkinan path
        for (const path of possiblePaths) {
            if (pages[path]) {
                return pages[path];
            }
        }

        // Jika tidak ditemukan, coba cari berdasarkan nama file
        const matchingPage = Object.keys(pages).find(path => {
            const pageName = path
                .replace('./pages/', '')
                .replace(/\.tsx$/, '')
                .replace('/Index', '');
            return pageName.toLowerCase() === name.toLowerCase().replace(/\./g, '/');
        });

        if (matchingPage && pages[matchingPage]) {
            return pages[matchingPage];
        }

        // Debug: tampilkan error dengan informasi yang berguna
        console.error(`Halaman tidak ditemukan: ${name}`);
        console.error('Halaman yang tersedia:', Object.keys(pages));
        console.error('Path yang dicoba:', possiblePaths);

        throw new Error(`Halaman tidak ditemukan: ${name}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// HAPUS BARIS INI:
// initializeTheme();
