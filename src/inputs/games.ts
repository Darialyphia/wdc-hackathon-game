import { generalsLookup } from '../sdk/generals';
import { z } from 'zod';

export const createGameInput = {
  generalId: z.string().refine(val => Object.keys(generalsLookup).includes(val))
};
