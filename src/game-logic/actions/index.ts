import { z } from 'zod';
import type { GameState } from '..';
import type { GameEvent } from '../events/reducer';

export const anyActionSchema = z.object({
  playerId: z.string()
});

export type AnyAction = z.infer<typeof anyActionSchema>;

export const defineAction =
  <T extends typeof anyActionSchema>({ input, handler }: ActionHandler<T>) =>
  (payload: z.infer<T>) =>
  (state: GameState) => {
    const validatedInput = input.safeParse(payload);

    if (!validatedInput.success) {
      console.error('wrong action input', payload);
      return [];
    }

    return handler({
      state,
      input: validatedInput.data as any
    });
  };

export type ActionHandler<T extends typeof anyActionSchema> = {
  input: T;
  handler: (arg: { input: z.infer<T>; state: GameState }) => GameEvent[];
};
