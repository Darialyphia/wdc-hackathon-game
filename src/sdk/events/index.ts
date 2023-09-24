import type { AnimatedSprite, Container, Spritesheet } from 'pixi.js';
import type { GameState } from '..';
import type { EntityId } from '../entity';
import type { Nullable } from '../../utils/types';
import type { ScreenMapContext } from '../../composables/game/useScreenMap';

export type EventHandler<
  TName extends string,
  TArgs extends any[],
  TPayload extends { sourceId: EntityId }
> = {
  create(...args: TArgs): { type: TName; payload: TPayload };
  execute(state: GameState, payload: TPayload): GameState;
  sequence: EventSequence<{ type: TName; payload: TPayload }>;
};

type AnyEvent = {
  type: string;
  payload: any;
};

export type EventSequence<T extends AnyEvent> = (
  state: GameState,
  event: T,
  ctx: {
    assets: {
      resolveSprite(key: string): Spritesheet;
      resolveTileset(key: string): Spritesheet;
      resolveFx(key: string): Spritesheet;
    };
    fxContainer: Container;
    sprites: {
      resolve(id: EntityId): Nullable<AnimatedSprite>;
    };
    screenMap: ScreenMapContext;
  }
) => Promise<void>;

export const defineEvent = <
  TName extends string,
  TArgs extends any[],
  TPayload extends { sourceId: EntityId }
>(
  handler: EventHandler<TName, TArgs, TPayload>
) => handler;
