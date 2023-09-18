import type { QueryCtx } from '../_generated/server';
import type { Nullable, Values } from '../utils/types';
import type { User } from './user.entity';

// ELO stuff
export const DEFAULT_ELO = 1200;

export const ELO_RESULTS = {
  LOSS: 0,
  DRAW: 0.5,
  WIN: 1
} as const;
export type EloResult = Values<typeof ELO_RESULTS>;

const K = 32;

const delta = (score: number, opponent: number, status: EloResult) => {
  const probability = 1 / (1 + Math.pow(10, (opponent - score) / 400));
  return Math.round(K * (status - probability));
};

export const computeNewElo = (elo: number, opponent: number, status: EloResult) => {
  return elo + delta(elo, opponent, status);
};

// username discriminator stuff
const MAX_DISCRIMINATOR_VALUE = 9999;

const generateRandomDiscriminator = () => {
  const num = Math.round(Math.random() * MAX_DISCRIMINATOR_VALUE);

  return String(num).padStart(4, '0');
};

export const generateDiscriminator = async (
  { db }: Pick<QueryCtx, 'db'>,
  name: string
) => {
  let discriminator = generateRandomDiscriminator();
  let existingUser: Nullable<User>;

  do {
    existingUser = await db
      .query('users')
      .withIndex('by_fullname', q =>
        q.eq('name', name).eq('discriminator', discriminator)
      )
      .unique();
    if (existingUser) {
      discriminator = generateRandomDiscriminator();
    }
  } while (existingUser != null);

  return discriminator;
};

// query helpers

export const findMe = async ({ auth, db }: Pick<QueryCtx, 'auth' | 'db'>) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return undefined;

  return db
    .query('users')
    .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique();
};
