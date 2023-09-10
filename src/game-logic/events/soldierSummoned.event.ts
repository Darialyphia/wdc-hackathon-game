import type { Point } from '@/utils/geometry';
import { addSoldier, type CharacterId, type EntityId } from '../entity';
import { defineEvent } from '.';
import {
  getActiveEntity,
  getGeneral,
  getSoldierById,
  isGeneral
} from '../utils/entity.helpers';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    sourceId: EntityId;
    characterId: CharacterId;
    position: Point;
    atbSeed: number;
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (
    sourceId: EntityId,
    characterId: CharacterId,
    position: Point,
    atbSeed: number
  ): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { sourceId, characterId, position, atbSeed }
  }),
  execute: (state, event) => {
    const activeEntity = getActiveEntity(state);
    if (!isGeneral(activeEntity)) return state;

    const general = getGeneral(state, activeEntity.owner);
    const blueprint = getSoldierById(event.characterId);
    if (!blueprint) return state;

    general.ap -= blueprint.cost;

    addSoldier(state, blueprint, {
      atbSeed: event.atbSeed,
      owner: activeEntity.owner,
      characterId: blueprint.characterId,
      position: event.position
    });

    activeEntity.hasSummonned = true;

    return state;
  }
});
