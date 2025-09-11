import { defineConfig } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(async () => ({
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        // ici on fixe le nom des assets
        assetFileNames: (assetInfo) => {
          // si le fichier est logo.png, on le garde sans hash
          if (assetInfo.name === 'A letter Logo.png') {
            return 'assets/[name][extname]';
          }
          // sinon garder le hash pour les autres assets
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
}));
