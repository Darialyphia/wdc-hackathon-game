import type { GameState } from '@/game-logic';
import type { TargetType } from './enums';
import { meleeAttack } from './meleeAttack';
import type { Entity } from '@/game-logic/entity';
import type { Point } from '@/utils/geometry';

export type SkillId = string;
export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
  range: number;
  targetType: TargetType;
  execute(state: GameState, caster: Entity, target: Point): void;
};

export const skills = { meleeAttack };
