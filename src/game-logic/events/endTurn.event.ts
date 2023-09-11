import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { endTurn } from '../utils/entity.helpers';

export const END_TURN = 'end_turn';

export type EndTurnEvent = {
  type: typeof END_TURN;
  payload: { sourceId: EntityId };
};

export const endTurnEvent = defineEvent({
  create: (sourceId: EntityId): EndTurnEvent => ({
    type: END_TURN,
    payload: { sourceId }
  }),
  execute: state => {
    endTurn(state);

    return state;
  }
});
