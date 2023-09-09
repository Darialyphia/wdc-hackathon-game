import type { Point } from '@/utils/geometry';
import { addSoldier, type CharacterId, type EntityId } from '../entity';
import { defineEvent } from '.';
import { getActiveEntity, getGeneral, isGeneral } from '../utils/entity.helpers';
import { soldiers } from '../../resources/soldiers';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    sourceId: EntityId;
    characterId: CharacterId;
    position: Point;
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (
    sourceId: EntityId,
    characterId: CharacterId,
    position: Point
  ): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { sourceId, characterId, position }
  }),
  execute: (state, event) => {
    const activeEntity = getActiveEntity(state);
    if (!isGeneral(activeEntity)) return state;

    const general = getGeneral(state, activeEntity.owner);
    const blueprint = soldiers[event.characterId];

    general.ap -= blueprint.cost;

    addSoldier(state, blueprint, {
      owner: activeEntity.owner,
      characterId: blueprint.characterId,
      position: event.position
    });

    activeEntity.hasSummonned = true;

    return state;
  }
});
