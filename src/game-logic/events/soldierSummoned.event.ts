import type { Point } from '@/utils/geometry';
import { addSoldier, type CharacterId, type EntityId } from '../entity';
import { defineEvent } from '.';
import {
  endTurn,
  getActiveEntity,
  getEntityById,
  getGeneral
} from '../utils/entity.helpers';
import type { SummonBlueprint } from '../summon';

export const SOLDIER_SUMMONED = 'soldier_summoned';

export type SoldierSummonedEvent = {
  type: typeof SOLDIER_SUMMONED;
  payload: {
    blueprint: SummonBlueprint;
    position: Point;
  };
};

export const soldierSummonedEvent = defineEvent({
  create: (blueprint: SummonBlueprint, position: Point): SoldierSummonedEvent => ({
    type: SOLDIER_SUMMONED,
    payload: { blueprint, position }
  }),
  execute: (state, event) => {
    const owner = getActiveEntity(state).owner;

    const general = getGeneral(state, owner);
    general.ap -= event.blueprint.cost;

    addSoldier(state, {
      owner,
      characterId: event.blueprint.characterId,
      position: event.position
    });
    return state;
  }
});
