import type { GameState } from '..';
import type { CharacterId, Entity } from '../entity';
import type { Point } from '../../utils/geometry';
import type { Values } from '../../utils/types';
import type { FactionId } from '../enums';
import type { Trigger } from '../trigger';
import type { Aura } from '../aura';

export const TARGET_TYPES = {
  SELF: 'SELF',
  ALLY: 'ALLY',
  ENEMY: 'ENEMY',
  EMPTY: 'EMPTY',
  ANYWHERE: 'ANYWHERE'
} as const;
export type TargetType = Values<typeof TARGET_TYPES>;

export const TARGET_ZONES = {
  LINE: 'LINE',
  RADIUS: 'RADIUS'
} as const;
export type TargetZone = Values<typeof TARGET_ZONES>;

export const AREA_TYPE = {
  CROSS: 'CROSS',
  LINE: 'LINE',
  SQUARE: 'SQUARE'
} as const;
export type AreaType = Values<typeof AREA_TYPE>;

export type SkillId = string;

export type SkillExecutionContext = {
  state: GameState;
  caster: Entity;
  target: Point;
};

export type SkillData = {
  id: SkillId;
  name: string;
  description: string;
  cost: number;
  range: number;
  minRange: number;
  targetZone: TargetZone;
  targetType: TargetType;
  areaType: AreaType;
  areaSize: number;
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
  maxAp: number;
  apRegenRate: number;
  attack: number;
  defense: number;
  speed: number;
  initiative: number;
  triggers: Trigger[];
  auras: Aura[];
};
