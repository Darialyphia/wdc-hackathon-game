import type { GameState } from '@/game-logic';
import type { TargetType } from './enums';
import { meleeAttack } from './meleeAttack';
import type { Entity } from '@/game-logic/entity';
import type { Point } from '@/utils/geometry';
import type { GameEvent } from '@/game-logic/events/reducer';

export type SkillId = string;
export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
  range: number;
  targetType: TargetType;
  execute(state: GameState, caster: Entity, target: Point): GameEvent[];
};

export const skills = { meleeAttack };
