import { defineSchema, defineTable } from 'convex/server';
import { Validator, v } from 'convex/values';
import type { GameState } from './games/game.entity';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    discriminator: v.string(),
    tokenIdentifier: v.string(),
    elo: v.number()
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_elo', ['elo']),

  games: defineTable({
    creator: v.id('users'),
    state: v.string() as Validator<GameState>,
    winnerId: v.optional(v.id('users'))
  }).index('by_creator', ['creator']),

  gameStates: defineTable({
    gameId: v.id('games'),
    state: v.string()
  }).index('by_game_id', ['gameId']),

  gameEventDeltas: defineTable({
    gameId: v.id('games'),
    events: v.array(v.object({ type: v.string(), payload: v.any() }))
  }).index('by_game_id', ['gameId']),

  gameMessages: defineTable({
    gameId: v.id('games'),
    userId: v.id('users'),
    text: v.string()
  }).index('by_game_id', ['gameId']),

  gamePlayers: defineTable({
    userId: v.id('users'),
    generalId: v.string(),
    gameId: v.id('games'),
    atbSeed: v.number()
  })
    .index('by_user_id', ['userId'])
    .index('by_game_id', ['gameId'])
});
