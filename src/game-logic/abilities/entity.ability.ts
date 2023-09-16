import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { Entity } from '../entity';
import type { GameMapCell } from '../map';
import { isCellWalkable } from '../utils/map.helpers';
import type { SkillData } from '../../resources/skills';
import { createAbility } from '../../utils/casl';
import { getSkillById } from '../utils/skill.helper';

type MapActions = 'move';
type SkillActions = 'cast';

type Abilities = [MapActions, 'cell' | GameMapCell] | [SkillActions, 'skill' | SkillData];

export type EntityAbility = PureAbility<Abilities>;

export const createEntityAbility = (state: GameState, entity: Entity): EntityAbility => {
  return createAbility<EntityAbility>(({ can }) => {
    can('move', 'cell', (subject: GameMapCell) => {
      return isCellWalkable(state, subject);
    });

    can('cast', 'skill', (subject: SkillData) => {
      const skill = getSkillById(entity, subject.id);

      return skill && entity.ap >= subject.cost;
    });
  });
};
