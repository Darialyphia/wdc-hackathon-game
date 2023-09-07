import { PureAbility, ForcedSubject } from '@casl/ability';
import { User } from './user.entity';
import { Nullable } from '../utils/types';
import { createAbility } from '../utils/ability';
import { QueryCtx } from '../_generated/server';

type Abilities = ['read' | 'edit' | 'create', 'user' | (User & ForcedSubject<'user'>)];

export type UserAbility = PureAbility<Abilities>;

const unAuthenticatedAbility = createAbility<UserAbility>(({ can, cannot }) => {
  can('read', 'user');

  cannot('edit', 'user');
  cannot('create', 'user');
});

export const createUserability = async ({
  auth,
  db
}: Pick<QueryCtx, 'auth' | 'db'>): Promise<UserAbility> => {
  const identity = await auth.getUserIdentity();

  if (!identity) return unAuthenticatedAbility;

  const sessionUser = await db
    .query('users')
    .withIndex('by_token', q => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique();

  return createAbility<UserAbility>(({ can }) => {
    can('read', 'user', 'email', (subject: User) => {
      return subject._id === identity.tokenIdentifier;
    });

    can('edit', 'user', (subject: User) => {
      return subject._id === identity.tokenIdentifier;
    });

    if (!sessionUser) {
      return can('create', 'user');
    }
  });
};
