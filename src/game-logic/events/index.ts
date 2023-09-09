import type { GameState } from '..';
import type { EntityId } from '../entity';

export type EventHandler<
  TName extends string,
  TArgs extends any[],
  TPayload extends { sourceId: EntityId }
> = {
  create(...args: TArgs): { type: TName; payload: TPayload };
  execute(state: GameState, payload: TPayload): GameState;
};

export const defineEvent = <
  TName extends string,
  TArgs extends any[],
  TPayload extends { sourceId: EntityId }
>(
  handler: EventHandler<TName, TArgs, TPayload>
) => handler;
