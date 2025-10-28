import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./crx.config";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), crx({ manifest }), tailwindcss()],
    build: {
        outDir: "dist",
        sourcemap: true,
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, "src/popup/index.html"),
                app: path.resolve(__dirname, "src/app/index.html"),
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
