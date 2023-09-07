import { PureAbility, type ForcedSubject } from '@casl/ability';
import type { GameState } from '..';
import type { Entity, General, PlayerId, Soldier } from '../entity';
import { isActive, isOwnEntity } from '../utils/entity.helpers';
import type { GameMapCell } from '../map';
import { isCellWalkable } from '../utils/map.helpers';

type MapActions = 'move';

type Abilities = [MapActions, 'cell' | (GameMapCell & ForcedSubject<'cell'>)];

export type EntityAbility = PureAbility<Abilities>;

export const createEntityAbility = (
  state: GameState,
  playerId: PlayerId
): EntityAbility => {
  return createAbility<EntityAbility>(({ can }) => {
    can('move', 'cell', (subject: GameMapCell) => {
      return isCellWalkable(state, subject);
    });
  });
};
