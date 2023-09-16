import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { SkillData } from '../../resources/skills';
import type { Point } from '../../utils/geometry';
import { exhaustiveSwitch } from '../../utils/assertions';
import type { Entity } from '../entity';
import { getActiveEntity, getEntityAt } from '../utils/entity.helpers';
import { createAbility } from '../../utils/casl';

type TargetActions = 'target' | 'highlight';

type Abilities = [TargetActions, 'cell' | Point];

export type SkillAbility = PureAbility<Abilities>;

export const createSkillAbility = (
  state: GameState,
  skill: SkillData,
  caster: Entity
): SkillAbility => {
  const isTargetTypeValid = (subject: Point) => {
    const { targetType } = skill;
    const entity = getEntityAt(state, subject);
    switch (targetType) {
      case 'GROUND':
        return true;
      case 'ALLY':
        return entity && entity?.owner === caster.owner;
      case 'ENEMY':
        return !!(entity && entity?.owner !== caster.owner);
      case 'SELF':
        return entity?.id === state.activeEntityId;
      case 'EMPTY':
        return entity === undefined;
      default:
        exhaustiveSwitch(targetType);
    }
  };

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

  const isInRange = ({ x, y }: Point) => {
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
        isTargetTypeValid(subject) && isTargetZoneValid(subject) && isInRange(subject)
      );
    });

    can('highlight', 'cell', (subject: Point) => {
      return isTargetZoneValid(subject) && isInRange(subject);
    });
  });
};
