import { Assets, Spritesheet } from 'pixi.js';
import { ASSET_BUNDLES } from '../../assets/manifest';
import type { Ref, InjectionKey } from 'vue';

type AssetsContext = {
  resolveSprite(key: string): Spritesheet;
  resolveTileset(key: string): Spritesheet;
  isReady: Ref<boolean>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  const isReady = ref(false);

  let tilesets: Record<string, Spritesheet>;
  let sprites: Record<string, Spritesheet>;

  const load = async () => {
    [tilesets, sprites] = await Promise.all([
      Assets.loadBundle(ASSET_BUNDLES.TILESETS),
      Assets.loadBundle(ASSET_BUNDLES.SPRITES)
      // Assets.loadBundle(ASSET_BUNDLES.PREFABS)
    ]);
    isReady.value = true;
  };

  load();
  const api = {
    isReady,
    resolveSprite(key: string) {
      return sprites[key];
    },
    resolveTileset(key: string) {
      return tilesets[key];
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
