import type { GameState } from '../../game-logic';
import type { TargetType, TargetZone } from './enums';
import { meleeAttack } from './meleeAttack';
import type { Entity } from '../../game-logic/entity';
import type { Point } from '../../utils/geometry';
import type { GameEvent } from '../../game-logic/events/reducer';
import { rangedAttack } from './rangedAttack';

export type SkillId = string;

export type SkillData = {
  id: SkillId;
  name: string;
  cost: number;
  range: number;
  minRange: number;
  targetZone: TargetZone;
  targetType: TargetType;
  iconUrl: string;
  execute(
    reducer: (state: GameState, event: GameEvent) => void,
    state: GameState,
    caster: Entity,
    target: Point
  ): void;
};

export const skills = { meleeAttack, rangedAttack };
