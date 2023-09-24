import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VueRouterAutoImports } from 'unplugin-vue-router';
import { fileURLToPath, URL } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import VueRouter from 'unplugin-vue-router/vite';
import Components from 'unplugin-vue-components/vite';
import { ArkUiResolver } from './tools/ark-ui-resolver';
import { VitePWA } from 'vite-plugin-pwa';

const pixiProjectionElements: string[] = [
  'camera-3d',
  'container-2d',
  'container-3d',
  'sprite-2d',
  'sprite-2s',
  'sprite-3d',
  'text-2d',
  'text-2s',
  'text-3d',
  'tiling-sprite-2d',
  'simple-mesh-2d',
  'simple-mesh-3d-2d',
  'mesh-2d',
  'mesh-3d-2d'
];
const customElements = [...pixiProjectionElements, 'viewport', 'layer'];

const prefix = 'pixi-';

export default defineConfig(async () => {
  const { isCustomElement, transformAssetUrls } = await import('vue3-pixi');

  return {
    plugins: [
      VueRouter({
        routesFolder: fileURLToPath(new URL('./src/pages', import.meta.url)),
        dts: './typed-router.d.ts'
      }),

      vue({
        reactivityTransform: true,
        script: {
          defineModel: true
        },
        template: {
          compilerOptions: {
            isCustomElement(name) {
              let normalizedName = name.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
              if (normalizedName.startsWith('-'))
                normalizedName = normalizedName.slice(1);

              const isPixiElement = customElements.includes(normalizedName);
              const isPrefixElement =
                normalizedName.startsWith(prefix) &&
                customElements.includes(normalizedName.slice(prefix.length));

              return isCustomElement(name) || isPixiElement || isPrefixElement;
            }
          },
          transformAssetUrls
        }
      }),

      AutoImport({
        include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
        imports: [
          'vue',
          '@vueuse/core',
          'vee-validate',
          VueRouterAutoImports,
          {
            '@auth0/auth0-vue': ['useAuth0']
          }
        ],
        dirs: ['./src/composables/**', './src/utils/**']
      }),

      Components({
        dts: true,
        extensions: ['vue'],
        globs: ['./src/components/**/*.vue', './src/directives/**/*.ts'],
        directoryAsNamespace: false,
        resolvers: [ArkUiResolver]
      }),

      VitePWA({
        registerType: 'prompt',
        srcDir: 'src',
        filename: 'sw.ts',
        strategies: 'injectManifest',
        devOptions: {
          enabled: false,
          type: 'module'
        },
        manifest: {
          name: 'Battle arena',
          short_name: 'BA',
          description: 'GOTY fr fr',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icon/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    server: {
      port: 3000
    }
  };
});
