import { assetsUrls } from '.';
import { type ResolverManifest } from 'pixi.js';
import type { Values } from '../utils/types';

export const ASSET_BUNDLES = {
  TILESETS: 'tilesets',
  SPRITES: 'sprites',
  PREFABS: 'prefabs'
} as const;

export type AssetBundle = Values<typeof ASSET_BUNDLES>;

export const assetsManifest = {
  bundles: [
    {
      name: ASSET_BUNDLES.TILESETS,
      assets: objectEntries(assetsUrls.tilesets).map(([name, srcs]) => ({
        name,
        srcs
      }))
    }
    // {
    //   name: ASSET_BUNDLES.SPRITES,
    //   assets: objectEntries(assetsUrls.sprites).map(([name, srcs]) => ({
    //     name,
    //     srcs
    //   }))
    // },
    // {
    //   name: ASSET_BUNDLES.PREFABS,
    //   assets: objectEntries(assetsUrls.prefabs).map(([name, srcs]) => ({
    //     name,
    //     srcs
    //   }))
    // }
  ]
} satisfies ResolverManifest;
