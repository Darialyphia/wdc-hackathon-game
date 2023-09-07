import { z } from 'zod';
import { defineEventHandler } from '.';

export const moveEvent = defineEventHandler({
  input: z.object({
    playerId: z.string(),
    target: z.object({
      x: z.number(),
      y: z.number()
    })
  }),
  handler: ({ input, state }) => {
    console.log(input);
  }
});
