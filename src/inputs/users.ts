import { z } from 'zod';

export const signupInput = {
  name: z.string().min(4).max(30)
};
