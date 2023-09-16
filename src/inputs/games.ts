import { generalIds } from '../sdk/generals';
import { z } from 'zod';

export const createGameInput = {
  generalId: z.string().refine(val => generalIds.includes(val))
};
