import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs/promises";
import { resolve } from "path";
import mkcert from "vite-plugin-mkcert";
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    // vite 配置
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react({
        include: ["**/*.jsx", "**/*.js", "**/*.ts", "**/*.tsx"],
      }),
      jsconfigPaths(),
      nodePolyfills(),
    ],

    esbuild: {
      // Add this configuration for JSX support
      jsxFactory: "h",
      jsxFragment: "Fragment",
    },
    build: {
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, "src/index.jsx"),
        name: "myLib",
        fileName: "myLib",
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
        external: [/^node:\w+/], // <-- ignores all 'node:*'
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      https: env.HTTPS === "true" ? true : false,
      host: true,
      strictPort: true,
      open: false, // previously set to true
      port: env.VITE_WEB_BASE_PORT,
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: "load-js-files-as-jsx",
            setup(build) {
              build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
                loader: "jsx",
                contents: await fs.readFile(args.path, "utf8"),
              }));
            },
          },
        ],
      },
    },
    preview: {
      port: env.VITE_WEB_BASE_PORT,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          math: "always",
          relativeUrls: true,
        },
      },
    },
  };
});
