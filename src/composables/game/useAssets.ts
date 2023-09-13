import { Assets, Spritesheet, extensions } from 'pixi.js';
import { ASSET_BUNDLES, assetsManifest } from '../../assets/manifest';
import type { InjectionKey } from 'vue';

export type AssetsContext = {
  resolveSprite(key: string): Spritesheet;
  resolveTileset(key: string): Spritesheet;
  resolveFx(key: string): Spritesheet;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  let tilesets: Record<string, Spritesheet>;
  let sprites: Record<string, Spritesheet>;
  let fxs: Record<string, Spritesheet>;

  const load = async () => {
    extensions.add(spriteSheetParser);
    Assets.init({ manifest: assetsManifest });

    [tilesets, sprites, fxs] = await Promise.all([
      Assets.loadBundle(ASSET_BUNDLES.TILESETS),
      Assets.loadBundle(ASSET_BUNDLES.SPRITES),
      Assets.loadBundle(ASSET_BUNDLES.FX)
      // Assets.loadBundle(ASSET_BUNDLES.PREFABS)
    ]);
  };

  const api = {
    load,
    resolveSprite(key: string) {
      return sprites[key];
    },
    resolveTileset(key: string) {
      return tilesets[key];
    },
    resolveFx(key: string) {
      return fxs[key];
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
