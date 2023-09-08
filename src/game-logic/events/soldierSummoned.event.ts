import type { Point } from '@/utils/geometry';
import { addSoldier } from '../entity';
import { defineEvent } from '.';
import { endTurn, getActiveEntity, getGeneral, isGeneral } from '../utils/entity.helpers';
import type { SoldierData } from '../../resources/soldiers';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    blueprint: SoldierData;
    position: Point;
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (blueprint: SoldierData, position: Point): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { blueprint, position }
  }),
  execute: (state, event) => {
    const activeEntity = getActiveEntity(state);
    if (!isGeneral(activeEntity)) return state;

    const general = getGeneral(state, activeEntity.owner);
    general.ap -= event.blueprint.cost;

    addSoldier(state, event.blueprint, {
      owner: activeEntity.owner,
      characterId: event.blueprint.id,
      position: event.position
    });

    activeEntity.hasSummonned = true;

    if (activeEntity.ap === 0) {
      endTurn(state);
    }

    return state;
  }
});
