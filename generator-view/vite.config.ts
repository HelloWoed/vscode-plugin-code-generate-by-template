import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import { join } from 'path';
// import { writeFileSync } from 'fs';
// import monacoEditorPlugin from "vite-plugin-monaco-editor";
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(), 
    // monacoEditorPlugin,
    // (() => {
    //   let basePath = '';
    //   return {
    //     name: 'custom-trans-assets-path',
    //     apply: 'build',
    //     configResolved(config) {
    //       basePath = `${config.base}${config.build.assetsDir}/`;
    //     },
    //     writeBundle(options, bundle) {
    //       for (const chunkName in bundle) {
    //         if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
    //           const chunk = bundle[chunkName] as any;
    //           if (chunk.fileName && chunk.fileName.endsWith('.html')) {
    //             console.log(chunk)
    //             chunk.source.replace(/\/assets\//g, () => {
    //               return './assets'
    //             });
    //             const fullPath = join(options.dir, chunk.fileName);
    //             writeFileSync(fullPath, chunk.source);
    //           }
    //         }
    //       }
    //     },
    //   }
    // })()
  ],
  build: {
    outDir: '../plugin/src/generate/generate-views/'
  }
});
