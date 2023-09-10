import { Values } from '@/utils/types';
import { Doc } from '../_generated/dataModel';

export type Game = Doc<'games'>;
export type GamePlayer = Doc<'gamePlayers'>;
export type GameEvent = Doc<'gameEvents'>;

export const GAME_STATES = {
  WAITING_FOR_OPPONENT: 'WAITING_FOR_OPPONENT',
  WAITING_FOR_CREATOR_CONFIRMATION: 'WAITING_FOR_CREATOR_CONFIRMATION',
  ONGOING: 'ONGOING',
  ENDED: 'ENDED'
} as const;
export type GameState = Values<typeof GAME_STATES>;

export const GAME_ACTIONS = {
  MOVE: 'move',
  SUMMON: 'summon',
  USE_SKILL: 'use_skill',
  END_TURN: 'end_turn'
} as const;
export type GameAction = Values<typeof GAME_ACTIONS>;
