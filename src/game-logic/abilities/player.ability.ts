import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { Entity, PlayerId } from '../entity';
import { getGeneral, isActive, isOwnEntity } from '../utils/entity.helpers';
import type { SummonBlueprint } from '../summon';
import type { Point } from '@/utils/geometry';
import { getCellAt, getSurroundingCells, isCellWalkable } from '../utils/map.helpers';

type EntityActions = 'move' | 'use_skill';
type SummonActions = 'summon';
type SummonAtActions = 'summon_at';

type Abilities =
  | [EntityActions, 'entity' | Entity]
  | [SummonActions, 'soldier' | SummonBlueprint]
  | [SummonAtActions, 'position' | Point];

export type PlayerAbility = PureAbility<Abilities>;

export const createPlayerAbility = (
  state: GameState,
  playerId: PlayerId
): PlayerAbility => {
  const general = getGeneral(state, playerId);

  const isOwnedAndActive = (e: Entity) => isOwnEntity(playerId, e) && isActive(state, e);

  return createAbility<PlayerAbility>(({ can }) => {
    can('move', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });

    can('use_skill', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });

    can('summon', 'soldier', (subject: SummonBlueprint) => {
      return isActive(state, general) && subject.cost <= general.ap;
    });

    can('summon_at', 'position', (subject: Point) => {
      if (!isCellWalkable(state, subject)) return false;

      const cell = getCellAt(state, subject);
      if (!cell) return false;

      const surroundingCells = getSurroundingCells(state, general.position);
      return surroundingCells.includes(cell);
    });
  });
};
