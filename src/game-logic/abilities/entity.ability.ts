import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { PlayerId } from '../entity';
import type { GameMapCell } from '../map';
import { isCellWalkable } from '../utils/map.helpers';

type MapActions = 'move';

type Abilities = [MapActions, 'cell' | GameMapCell];

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
