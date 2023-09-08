import type { GameState } from '..';

export type EventHandler<TName extends string, TArgs extends any[], TPayload> = {
  create(...args: TArgs): { type: TName; payload: TPayload };
  execute(state: GameState, payload: TPayload): GameState;
};

export const defineEvent = <TName extends string, TArgs extends any[], TPayload>(
  handler: EventHandler<TName, TArgs, TPayload>
) => handler;
