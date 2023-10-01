import { internalMutation, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { ELO_RESULTS, computeNewElo, findMe } from './users/user.utils';
import { createUserability } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { GAME_STATES, type GameAction } from './games/game.entity';
import { subject } from '@casl/ability';
import { internal } from './_generated/api';
import { JOIN_CONFIRMATION_TIMEOUT } from './games/game.utils';
import {
  createGameState,
  fromSerializedState,
  serializeGameState
} from '../src/sdk/index';
import { createMoveAction } from '../src/sdk/actions/move';
import { createSummonAction } from '../src/sdk/actions/summon';
import { createSkillAction } from '../src/sdk/actions/skill';
import { createEndTurnAction } from '../src/sdk/actions/endTurn';
import { exhaustiveSwitch } from '../src/utils/assertions';
import type { Id } from './_generated/dataModel';
import { paginationOptsValidator } from 'convex/server';
import { parse, stringify } from 'zipson';
import { ITiledMap, ITiledMapTileset } from '@workadventure/tiled-map-type-guard';
import pkgJson from '../package.json';

import hardcodedMap from '../src/assets/maps/iso/iso.json';
import hardcodedTileset from '../src/assets/maps/iso/tileset.json';

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
      state: GAME_STATES.WAITING_FOR_OPPONENT,
      version: pkgJson.version
    });

    await db.insert('gamePlayers', {
      generalId,
      gameId,
      userId: user!._id,
      atbSeed: Math.random()
    });

    return gameId;
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

    await scheduler.runAfter(JOIN_CONFIRMATION_TIMEOUT, internal.games.decline, {
      gameId: game._id
    });

    return game._id;
  }
});

export const decline = internalMutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db, scheduler }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return;

    if (game.state === GAME_STATES.WAITING_FOR_CREATOR_CONFIRMATION) {
      await db.patch(game._id, {
        state: GAME_STATES.DECLINED_BY_CREATOR
      });

      await scheduler.runAfter(5000, internal.games.internalCancel, {
        gameId: game._id
      });
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

    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    await Promise.all([
      db.patch(game._id, {
        state: GAME_STATES.ONGOING
      }),

      db.insert('gameEventDeltas', {
        gameId: game._id,
        events: []
      }),

      db.insert('gameStates', {
        gameId: game._id,
        state: stringify(
          serializeGameState(
            createGameState({
              map: {
                map: hardcodedMap as ITiledMap,
                tileset: hardcodedTileset as ITiledMapTileset
              },
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
              ],
              history: []
            })
          )
        )
      })
    ]);
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
  handler: async ({ auth, db, scheduler }, { gameId, action }) => {
    const me = await findMe({ auth, db });
    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('act_on', subject('game', game)));

    // replay game event to get to current state
    const serializedState = await db
      .query('gameStates')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .first();

    if (!serializedState) return;
    const state = fromSerializedState(parse(serializedState?.state ?? ''));

    // Execute the new action
    const type = action.type as GameAction;
    switch (type) {
      case 'move':
        createMoveAction({ ...action.payload, playerId: me!._id })(state);
        break;
      case 'summon':
        createSummonAction({ ...action.payload, playerId: me!._id })(state);
        break;
      case 'use_skill':
        createSkillAction({ ...action.payload, playerId: me!._id })(state);
        break;
      case 'end_turn':
        createEndTurnAction({ ...action.payload, playerId: me!._id })(state);
        break;
      default:
        exhaustiveSwitch(type);
        throw new Error(`Unknown action type: ${type}`);
    }

    await Promise.all([
      db.insert('gameEventDeltas', {
        gameId: game._id,
        events: state.history
      }),
      db.patch(serializedState._id, {
        state: stringify(serializeGameState(state))
      })
    ]);

    if (state.lifecycleState === 'FINISHED') {
      await db.patch(game._id, {
        state: GAME_STATES.ENDED,
        winnerId: state.winner as Id<'users'>
      });
      scheduler.runAfter(0, internal.games.handleGameEnd, {
        gameId: game._id
      });
    }
  }
});

export const handleGameEnd = internalMutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return;
    if (!game.winnerId) return;

    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    const [user1, user2] = await Promise.all(
      gamePlayers.map(player => db.get(player.userId))
    );

    await Promise.all([
      db.patch(user1!._id, {
        elo: computeNewElo(
          user1!.elo,
          user2!.elo,
          game.winnerId === user1!._id ? ELO_RESULTS.WIN : ELO_RESULTS.LOSS
        )
      }),
      db.patch(user2!._id, {
        elo: computeNewElo(
          user2!.elo,
          user1!.elo,
          game.winnerId === user2!._id ? ELO_RESULTS.WIN : ELO_RESULTS.LOSS
        )
      })
    ]);
  }
});
export const surrender = mutation({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ auth, db, scheduler }, { gameId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return null;
    const me = await findMe({ auth, db });
    if (!me) return null;

    const game = await db.get(gameId);
    if (!game) throw new Error('Game not found');

    const userAbility = await createUserability({ auth, db });
    await ensureAuthorized(userAbility.can('surrender', subject('game', game)));

    const players = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .collect();

    const winner = players.find(p => p.userId !== me._id)!;

    await db.patch(game._id, {
      state: GAME_STATES.ENDED,
      winnerId: winner.userId
    });

    scheduler.runAfter(0, internal.games.handleGameEnd, {
      gameId: game._id
    });
  }
});

export const getById = query({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return null;

    const players = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    const playersWithUser = await Promise.all(
      players.map(async player => {
        const user = await db.get(player.userId);
        return Object.assign({}, player, { user });
      })
    );

    const serializedState = await db
      .query('gameStates')
      .withIndex('by_game_id', q => q.eq('gameId', game._id))
      .first();

    return {
      ...game,
      serializedState: serializedState?.state,
      creator: await db.get(game.creator),
      players: playersWithUser
    };
  }
});

export const latestEventBatch = query({
  args: { gameId: v.id('games') },
  handler: async ({ db }, { gameId }) => {
    return db
      .query('gameEventDeltas')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .order('desc')
      .first();
  }
});

export const getList = query({
  args: {},
  handler: async ({ db }) => {
    const games = await db
      .query('games')
      .filter(q => q.neq(q.field('state'), GAME_STATES.ENDED))
      .collect();
    return Promise.all(
      games.map(async game => ({
        ...game,
        creator: await db.get(game.creator)
      }))
    );
  }
});

export const currentGame = query({
  args: {},
  handler: async ({ auth, db }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return null;
    const me = await findMe({ auth, db });
    if (!me) return null;

    const gamePlayers = await db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', me?._id))
      .collect();

    const games = await Promise.all(gamePlayers.map(gp => db.get(gp.gameId)));

    return games.find(game => game?.state !== 'ENDED') ?? null;
  }
});

export const getGameMessages = query({
  args: {
    gameId: v.id('games')
  },
  handler: async ({ db }, { gameId }) => {
    const game = await db.get(gameId);
    if (!game) return null;

    const players = await db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    const users = await Promise.all(
      players.map(async player => {
        return db.get(player.userId);
      })
    );

    const messages = await db
      .query('gameMessages')
      .withIndex('by_game_id', q => q.eq('gameId', gameId))
      .collect();

    return messages.map(m => ({
      ...m,
      user: users.find(u => u?._id === m.userId)!
    }));
  }
});

export const postMessageToGame = mutation({
  args: {
    gameId: v.id('games'),
    text: v.string()
  },
  handler: async ({ db, auth }, { gameId, text }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return null;
    const me = await findMe({ auth, db });
    if (!me) return null;

    return db.insert('gameMessages', { gameId, text, userId: me._id });
  }
});

export const clearAllGames = internalMutation({
  args: {},
  handler: async ({ db }) => {
    const games = await db.query('games').collect();
    const players = await db.query('gamePlayers').collect();
    const messages = await db.query('gameMessages').collect();
    const events = await db.query('gameEventDeltas').collect();
    const states = await db.query('gameStates').collect();

    await Promise.all([
      ...players.map(p => db.delete(p._id)),
      ...games.map(g => db.delete(g._id)),
      ...messages.map(m => db.delete(m._id)),
      ...events.map(e => db.delete(e._id)),
      ...states.map(s => db.delete(s._id))
    ]);
  }
});

export const latestGames = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async ({ db }, args) => {
    const games = await db
      .query('games')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('state'), 'ENDED'))
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...games,
      page: await Promise.all(
        games.page.map(async game => {
          const players = await db
            .query('gamePlayers')
            .withIndex('by_game_id', q => q.eq('gameId', game._id))
            .collect();

          return {
            ...game,
            players: await Promise.all(
              players.map(async player => {
                const user = await db.get(player.userId);

                return {
                  ...player,
                  user: user!
                };
              })
            )
          };
        })
      )
    };
  }
});
