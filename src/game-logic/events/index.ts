import { z } from 'zod';
import type { GameState } from '..';

export const AnyEvent = z.object({
  playerId: z.string()
});

export const defineEventHandler = <T extends typeof AnyEvent>(
  handler: GameEventHandler<T>
) => handler;

export type GameEventHandler<T extends typeof AnyEvent> = {
  input: T;
  handler: (arg: { input: z.infer<T>; state: GameState }) => void;
};
