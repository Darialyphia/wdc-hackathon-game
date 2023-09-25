import { PureAbility, subject } from '@casl/ability';
import type { GameState } from '..';
import type { Entity } from '../entity';
import type { GameMapCell } from '../map';
import { isCellWalkable } from '../utils/map.helpers';
import { createAbility } from '../../utils/casl';
import { getSkillById } from '../utils/skill.helpers';
import type { SkillData } from '../utils/entityData';

type MapActions = 'move';
type SkillActions = 'cast';

type Abilities = [MapActions, 'cell' | GameMapCell] | [SkillActions, 'skill' | SkillData];

export type EntityAbility = PureAbility<Abilities>;

export const createEntityAbility = (state: GameState, entity: Entity): EntityAbility => {
  return createAbility<EntityAbility>(({ can, cannot }) => {
    can('move', 'cell', (subject: GameMapCell) => {
      return isCellWalkable(state, subject);
    });

    can('cast', 'skill', (subject: SkillData) => {
      const skill = getSkillById(entity, subject.id);

      return skill && entity.ap >= subject.cost;
    });

    cannot('cast', 'skill', () => {
      return entity.hasDoneAction;
    });
  });
};
