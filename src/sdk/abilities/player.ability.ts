import { PureAbility } from '@casl/ability';
import type { GameState } from '..';
import type { Entity, PlayerId } from '../entity';
import {
  getActiveEntity,
  getGeneral,
  isActive,
  isOwnEntity
} from '../utils/entity.helpers';
import type { Point } from '../../utils/geometry';
import { getCellAt, getSurroundingCells, isCellWalkable } from '../utils/map.helpers';
import type { SoldierData } from '../soldiers';
import { createAbility } from '../../utils/casl';

type EntityActions = 'move' | 'use_skill';
type SummonActions = 'summon';
type SummonAtActions = 'summon_at';
type EndTurnAction = 'end_turn';
type Abilities =
  | [EntityActions, 'entity' | Entity]
  | [SummonActions, 'soldier' | SoldierData]
  | [SummonAtActions, 'position' | Point]
  | [EndTurnAction, 'turn'];

export type PlayerAbility = PureAbility<Abilities>;

export const createPlayerAbility = (
  state: GameState,
  playerId: PlayerId
): PlayerAbility => {
  const general = getGeneral(state, playerId);

  const isOwnedAndActive = (e: Entity) => isOwnEntity(playerId, e) && isActive(state, e);

  return createAbility<PlayerAbility>(({ can }) => {
    if (getActiveEntity(state).owner === playerId) {
      can('end_turn', 'turn');
    }

    can('move', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });

    can('use_skill', 'entity', (subject: Entity) => {
      return isOwnedAndActive(subject);
    });

    if (!general.hasSummonned) {
      can('summon', 'soldier', (subject: SoldierData) => {
        const { summonBlueprints } = general.blueprint;
        if (!Object.values(summonBlueprints).includes(subject)) return false;

        return isActive(state, general) && subject.cost <= general.ap;
      });
    }

    can('summon_at', 'position', (subject: Point) => {
      if (!isCellWalkable(state, subject)) return false;

      const cell = getCellAt(state, subject);
      if (!cell) return false;

      const surroundingCells = getSurroundingCells(state, general.position);
      return surroundingCells.includes(cell);
    });
  });
};
