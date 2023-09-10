import { internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { findMe } from './users/user.utils';
import { createUserability } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { GAME_STATES, GameAction } from './games/game.entity';
import { subject } from '@casl/ability';
import { JOIN_CONFIRMATION_TIMEOUT } from './games/game.utils';
import { createGameState } from '../src/game-logic/index';
import { reducer, GameEvent as GameLogicEvent } from '../src/game-logic/events/reducer';
import { createMoveAction } from '../src/game-logic/actions/move';
import { createSummonAction } from '../src/game-logic/actions/summon';
import { createSkillAction } from '../src/game-logic/actions/skill';
import { createEndTurnAction } from '../src/game-logic/actions/endTurn';
import { exhaustiveSwitch } from '../src/utils/assertions';

// Create a new task with the given text
export const create = mutation({
  args: {
    generalId: v.string()
  },
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

    await Promise.allSettled([
      ...gamePlayers.map(gp => db.delete(gp._id)),
      db.delete(game._id)
    ]);
  }
});

export const join = mutation({
  args: {
    gameId: v.id('games'),
    generalId: v.string()
  },
  handler: async ({ auth, db, scheduler }, { gameId, generalId }) => {
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

    // await scheduler.runAfter(JOIN_CONFIRMATION_TIMEOUT, internal.games.decline, {
    //   gameId: game._id
    // });
  }
});

export const decline = internalMutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db, scheduler }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return;

    if (game.creator === GAME_STATES.WAITING_FOR_CREATOR_CONFIRMATION) {
      await db.patch(game._id, {
        state: GAME_STATES.DECLINED_BY_CREATOR
      });

      // await scheduler.runAfter(5000, internal.games.internalCancel, {
      //   gameId: game._id
      // });
    }
  }
});

export const internalCancel = internalMutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return;

    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .collect();

    await Promise.allSettled([
      ...gamePlayers.map(gp => db.delete(gp._id)),
      db.delete(game._id)
    ]);
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

export const surrender = mutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ auth, db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('surrender', subject('game', game)));

    await db.patch(game._id, {
      state: GAME_STATES.ENDED
    });
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
