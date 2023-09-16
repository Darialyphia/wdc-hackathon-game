import { query } from './_generated/server';
import { createUserability } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { ensureAuthenticated } from './utils/auth';
import { findMe, generateDiscriminator } from './users/user.utils';
import { toUserDto } from './users/user.mapper';
import { mutationWithZod } from './utils/zod';
import { signupInput } from '../src/inputs/users';
import { v } from 'convex/values';
import { isDefined } from '../src/utils/assertions';

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

export const getProfile = query({
  args: {
    userId: v.id('users')
  },
  handler: async ({ db }, { userId }) => {
    const user = await db.get(userId);
    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .collect();

    const games = (
      await Promise.all(
        gamePlayers
          .sort((a, b) => b._creationTime - a._creationTime)
          .map(async gp => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { history, ...game } = (await db.get(gp.gameId))!;
            if (game.state !== 'ENDED') return null;

            const players = await db
              .query('gamePlayers')
              .withIndex('by_game_id', q => q.eq('gameId', game._id))
              .collect();

            const opponent = await db.get(players.find(p => p.userId !== userId)!.userId);

            return {
              ...game,
              opponent,
              isWinner: game.winnerId === userId
            };
          })
      )
    ).filter(isDefined);

    return {
      ...user,
      games,
      winrate: (games.filter(g => g.isWinner).length / games.length) * 100
    };
  }
});
