import { z } from 'zod';
import type { GameState } from '..';

export const anyEventSchema = z.object({
  playerId: z.string()
});

export type AnyEvent = z.infer<typeof anyEventSchema>;

export const defineEventHandler =
  <T extends typeof anyEventSchema>({ input, handler }: GameEventHandler<T>) =>
  (payload: unknown, state: GameState) => {
    const validatedInput = input.safeParse(payload);

    if (!validatedInput.success) return;

    handler({
      state,
      input: validatedInput.data as any
    });
  };

export type GameEventHandler<T extends typeof anyEventSchema> = {
  input: T;
  handler: (arg: { input: z.infer<T>; state: GameState }) => void;
};
