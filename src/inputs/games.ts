import { generalIds } from '@/resources/generals';
import { z } from 'zod';
import { isString } from '@/utils/assertions';

export const createGameInput = {
  generalId: z.string().refine(val => generalIds.includes(val))
};
