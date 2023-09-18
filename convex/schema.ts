import { defineSchema, defineTable } from 'convex/server';
import { Validator, v } from 'convex/values';
import type { GameState } from './games/game.entity';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    discriminator: v.string(),
    tokenIdentifier: v.string()
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_fullname', ['name', 'discriminator']),

  games: defineTable({
    creator: v.id('users'),
    state: v.string() as Validator<GameState>,
    winnerId: v.optional(v.id('users'))
  }).index('by_creator', ['creator']),

  gameEventHistories: defineTable({
    gameId: v.id('games'),
    history: v.string()
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
