import { PureAbility } from '@casl/ability';
import type { User } from './user.entity';
import { createAbility } from '../utils/ability';
import type { QueryCtx } from '../_generated/server';
import { GAME_STATES, type Game } from '../games/game.entity';

type UserActions = 'read' | 'edit' | 'create';
type GameActions =
  | 'read'
  | 'create'
  | 'cancel'
  | 'join'
  | 'confirm'
  | 'act_on'
  | 'surrender';

type Abilities = [UserActions, 'user' | User] | [GameActions, 'game' | Game];

export type UserAbility = PureAbility<Abilities>;

const unAuthenticatedAbility = createAbility<UserAbility>(({ can }) => {
  can('read', 'user');
  can('read', 'game');
});

const onboardingAbility = createAbility<UserAbility>(({ can }) => {
  can('create', 'user');
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

  if (!sessionUser) return onboardingAbility;

  const gamePlayers = await db
    .query('gamePlayers')
    .withIndex('by_user_id', q => q.eq('userId', sessionUser?._id))
    .collect();
  const games = await Promise.all(gamePlayers.map(({ gameId }) => db.get(gameId)));

  const isAvailableForGame = games.every(game => game?.state === GAME_STATES.ENDED);

  return createAbility<UserAbility>(({ can }) => {
    can('read', 'user');
    can('edit', 'user', (subject: User) => {
      return subject._id === identity.tokenIdentifier;
    });

    can('read', 'game');
    if (isAvailableForGame) {
      can('create', 'game');
      can(
        'join',
        'game',
        (subject: Game) => subject.state === GAME_STATES.WAITING_FOR_OPPONENT
      );
    }

    can('confirm', 'game', (subject: Game) => {
      return (
        subject.state === GAME_STATES.WAITING_FOR_CREATOR_CONFIRMATION &&
        subject.creator === sessionUser._id
      );
    });

    can('cancel', 'game', (subject: Game) => {
      return (
        subject.state === GAME_STATES.WAITING_FOR_OPPONENT &&
        subject.creator === sessionUser._id
      );
    });

    can('act_on', 'game', (subject: Game) => {
      return (
        subject.state === 'ONGOING' && gamePlayers.some(gp => gp.gameId === subject._id)
      );
    });

    can('surrender', 'game', (subject: Game) => {
      return (
        subject.state === 'ONGOING' && gamePlayers.some(gp => gp.gameId === subject._id)
      );
    });
  });
};
