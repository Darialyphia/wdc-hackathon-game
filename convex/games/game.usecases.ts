import { ensureAuthorized } from '../utils/ability';
import { mutationWithZod } from '../utils/zod';
import { createGameInput } from '@/inputs/games';
import { findMe } from '../users/user.utils';
import { createUserability } from '../users/user.ability';
import { GAME_STATES, GameAction, GameEvent } from './game.entity';
import { GameEvent as GameLogicEvent } from '@/game-logic/events/reducer';
import { subject } from '@casl/ability';
import { mutation, query } from '_generated/server';
import { v } from 'convex/values';
import { createGameState } from '@/game-logic';
import { createMoveAction } from '@/game-logic/actions/move';
import { createSummonAction } from '@/game-logic/actions/summon';
import { createSkillAction } from '@/game-logic/actions/skill';
import { createEndTurnAction } from '@/game-logic/actions/endTurn';
import { reducer } from '@/game-logic/events/reducer';
import { exhaustiveSwitch } from '@/utils/assertions';

export const create = mutationWithZod({
  args: createGameInput,
  handler: async ({ auth, db }, { generalId }) => {
    const user = await findMe({ auth, db });
    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('create', 'game'));

    const gameId = await db.insert('games', {
      creator: user!._id,
      state: GAME_STATES.WAITING_FOR_OPPONENT
    });

    return db.insert('gamePlayers', {
      generalId,
      gameId,
      userId: user!._id,
      atbSeed: Math.random()
    });
  }
});

export const cancel = mutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ auth, db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('cancel', subject('game', game)));

    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .collect();
    await Promise.all([...gamePlayers.map(gp => db.delete(gp._id)), db.delete(game._id)]);
  }
});

export const join = mutation({
  args: {
    gameId: v.id('games'),
    generalId: v.string()
  },
  handler: async ({ auth, db }, { gameId, generalId }) => {
    const user = await findMe({ auth, db });
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('join', subject('game', game)));

    await db.insert('gamePlayers', {
      gameId,
      generalId,
      userId: user!._id,
      atbSeed: Math.random()
    });

    await db.patch(game._id, {
      state: GAME_STATES.WAITING_FOR_CREATOR_CONFIRMATION
    });
  }
});

export const confirm = mutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ auth, db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('confirm', subject('game', game)));

    await db.patch(game._id, {
      state: GAME_STATES.ONGOING
    });
  }
});

export const actOn = mutation({
  args: {
    gameId: v.id('games'),
    action: v.object({
      type: v.string(),
      payload: v.any()
    })
  },
  handler: async ({ auth, db }, { gameId, action }) => {
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('act_on', subject('game', game)));

    // get game infos from DB
    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();
    const gameEvents = await db
      .query('gameEvents')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    // replay game event to get to current state
    const state = createGameState({
      players: [
        {
          id: gamePlayers[0].userId,
          characterId: gamePlayers[0].generalId,
          atbSeed: gamePlayers[0].atbSeed
        },
        {
          id: gamePlayers[1].userId,
          characterId: gamePlayers[1].generalId,
          atbSeed: gamePlayers[1].atbSeed
        }
      ]
    });

    gameEvents.forEach(event => {
      reducer(state, {
        type: event.type as GameLogicEvent['type'],
        payload: event.payload
      });
    });

    // Execute the new action
    const type = action.type as GameAction;
    switch (type) {
      case 'move':
        createMoveAction(action.payload)(state);
        break;
      case 'summon':
        createSummonAction(action.payload)(state);
        break;
      case 'use_skill':
        createSkillAction(action.payload)(state);
        break;
      case 'end_turn':
        createEndTurnAction(action.payload)(state);
        break;
      default:
        exhaustiveSwitch(type);
        throw new Error(`Unknown action type: ${type}`);
    }

    // collect the new events to save to the database
    const diff = state.history.length - gameEvents.length;
    const newEvents = state.history.slice(-1 * diff);

    await Promise.all(
      newEvents.map(event =>
        db.insert('gameEvents', {
          gameId,
          type: event.type,
          payload: event.payload
        })
      )
    );
  }
});

export const getById = query({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db }, { gameId }) => {
    const game = db.get(gameId);
    const events = db
      .query('gameEvents')
      .withIndex('by_game_id', q => q.eq('gameId', gameId)).collect;

    return {
      ...game,
      events
    };
  }
});
