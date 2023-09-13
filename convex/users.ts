import { query } from './_generated/server';
import { createUserability } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { ensureAuthenticated } from './utils/auth';
import { findMe, generateDiscriminator } from './users/user.utils';
import { toUserDto } from './users/user.mapper';
import { mutationWithZod } from './utils/zod';
import { signupInput } from '../src/inputs/users';

export const signUp = mutationWithZod({
  args: signupInput,
  handler: async ({ auth, db }, { name }) => {
    const identity = await ensureAuthenticated({ auth });
    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('create', 'user'));

    return db.insert('users', {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      tokenIdentifier: identity.tokenIdentifier
    });
  }
});

export const me = query({
  handler: async ctx => {
    const user = await findMe(ctx);

    if (!user) return null;

    return toUserDto(user);
  }
});
