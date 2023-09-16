import type { GameState } from '..';
import type { CharacterId, Entity } from '../entity';
import type { GameEvent } from '../events/reducer';
import type { Point } from '../../utils/geometry';
import type { Values } from '../../utils/types';
import type { FactionId } from '../enums';
import type { Trigger } from '../trigger';

export const TARGET_TYPES = {
  SELF: 'SELF',
  GROUND: 'GROUND',
  ALLY: 'ALLY',
  ENEMY: 'ENEMY',
  EMPTY: 'EMPTY'
} as const;

export type TargetType = Values<typeof TARGET_TYPES>;

export const TARGET_ZONES = {
  LINE: 'LINE',
  RADIUS: 'RADIUS'
} as const;

export type TargetZone = Values<typeof TARGET_ZONES>;

export type SkillId = string;

export type SkillExecutionContext = {
  reducer: (state: GameState, event: GameEvent) => void;
  state: GameState;
  caster: Entity;
  target: Point;
};

export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
  range: number;
  minRange: number;
  targetZone: TargetZone;
  targetType: TargetType;
  iconUrl: string;
  execute(ctx: SkillExecutionContext): void;
};

export type EntityData = {
  factionId: FactionId;
  characterId: CharacterId;
  iconUrl: string;
  name: string;
  skills: SkillData[];
  maxHp: number;
  attack: number;
  defense: number;
  initiative: number;
  spriteId: string;
  triggers: Trigger[];
};
