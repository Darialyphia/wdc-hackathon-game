import type { QueryCtx } from '../_generated/server';
import type { Nullable } from '../utils/types';
import type { User } from './user.entity';

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

export const findMe = async ({ auth, db }: Pick<QueryCtx, 'auth' | 'db'>) => {
  const identity = await auth.getUserIdentity();
  if (!identity) return undefined;

  return db
    .query('users')
    .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique();
};
