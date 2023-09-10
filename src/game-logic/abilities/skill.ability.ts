import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { SkillData } from '../../resources/skills';
import type { Point } from '../../utils/geometry';
import { exhaustiveSwitch } from '../../utils/assertions';
import type { Entity } from '../entity';
import { getEntityAt } from '../utils/entity.helpers';
import { createAbility } from '../../utils/casl';

type TargetActions = 'target';

type Abilities = [TargetActions, 'cell' | Point];

export type SkillAbility = PureAbility<Abilities>;

export const createSkillAbility = (
  state: GameState,
  skill: SkillData,
  caster: Entity
): SkillAbility => {
  return createAbility<SkillAbility>(({ can, cannot }) => {
    can('target', 'cell', (subject: Point) => {
      const { targetType } = skill;
      const entity = getEntityAt(state, subject);

      switch (targetType) {
        case 'ANYTHING':
          return true;
        case 'ALLY':
          return entity && entity?.owner === caster.owner;
        case 'ENEMY':
          return !!(entity && entity?.owner !== caster.owner);
        case 'LINE':
          return subject.x === caster.position.x || subject.y === caster.position.y;
        default:
          exhaustiveSwitch(targetType);
      }
    });

    cannot('target', 'cell', ({ x, y }: Point) => {
      return (
        Math.abs(x - caster.position.x) > skill.range ||
        Math.abs(y - caster.position.y) > skill.range
      );
    });
  });
};
