import { generalIds } from '../game-logic/generals';
import { z } from 'zod';

export const createGameInput = {
  generalId: z.string().refine(val => generalIds.includes(val))
};
