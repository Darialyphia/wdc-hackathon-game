import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { Point } from '../../utils/geometry';
import { exhaustiveSwitch } from '../../utils/assertions';
import type { Entity } from '../entity';
import { getActiveEntity, getEntityAt } from '../utils/entity.helpers';
import { createAbility } from '../../utils/casl';
import type { SkillData } from '../utils/entityData';
import { isTargetTypeValid } from '../utils/skill.helpers';

type CellActions = 'target' | 'highlight';

type Abilities = [CellActions, 'cell' | Point];

export type SkillAbility = PureAbility<Abilities>;

export const createSkillAbility = (
  state: GameState,
  skill: SkillData,
  caster: Entity
): SkillAbility => {
  const isTargetZoneValid = (subject: Point) => {
    const { targetZone } = skill;
    const activeEntity = getActiveEntity(state);

    switch (targetZone) {
      case 'RADIUS':
        return true;
      case 'LINE':
        return (
          activeEntity.position.x === subject.x || activeEntity.position.y === subject.y
        );
      default:
        exhaustiveSwitch(targetZone);
    }
  };

  const isInCastRange = ({ x, y }: Point) => {
    const isMaxRangeOk =
      Math.abs(x - caster.position.x) <= skill.range &&
      Math.abs(y - caster.position.y) <= skill.range;
    const isMinRangeOk =
      Math.abs(x - caster.position.x) >= skill.minRange ||
      Math.abs(y - caster.position.y) >= skill.minRange;

    return isMaxRangeOk && isMinRangeOk;
  };

  return createAbility<SkillAbility>(({ can }) => {
    can('target', 'cell', (subject: Point) => {
      return (
        isTargetTypeValid(subject, { state, caster, skill }) &&
        isTargetZoneValid(subject) &&
        isInCastRange(subject)
      );
    });

    can('highlight', 'cell', (subject: Point) => {
      return isTargetZoneValid(subject) && isInCastRange(subject);
    });
  });
};
