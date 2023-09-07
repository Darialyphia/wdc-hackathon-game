import { PureAbility, type ForcedSubject } from '@casl/ability';
import type { GameState } from '..';
import type { Entity, PlayerId } from '../entity';
import { isActive, isOwnEntity } from '../utils/entity.helpers';

type EntityActions = 'move' | 'use_skill';

type Abilities = [EntityActions, 'entity' | (Entity & ForcedSubject<'entity'>)];

export type PlayerAbility = PureAbility<Abilities>;

export const createPlayerAbility = (
  state: GameState,
  playerId: PlayerId
): PlayerAbility => {
  const isOwnedAndActive = (e: Entity) => isOwnEntity(playerId, e) && isActive(state, e);

  return createAbility<PlayerAbility>(({ can }) => {
    can('move', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });

    can('use_skill', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });
  });
};
