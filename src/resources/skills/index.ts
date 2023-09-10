import type { GameState } from '../../game-logic';
import type { TargetType } from './enums';
import { meleeAttack } from './meleeAttack';
import type { Entity } from '../../game-logic/entity';
import type { Point } from '../../utils/geometry';
import type { GameReducer } from '../../game-logic/events/reducer';

export type SkillId = 'melee_attack';

export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
  range: number;
  targetType: TargetType;
  execute(reducer: GameReducer, state: GameState, caster: Entity, target: Point): void;
};

export const skills = { meleeAttack };
