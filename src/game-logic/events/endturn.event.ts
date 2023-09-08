import { defineEvent } from '.';
import { endTurn } from '../utils/entity.helpers';

export const END_TURN = 'end_turn';

export type EndTurnEvent = {
  type: typeof END_TURN;
  payload: Record<string, never>;
};

export const endTurnEvent = defineEvent({
  create: (): EndTurnEvent => ({
    type: END_TURN,
    payload: {}
  }),
  execute: state => {
    endTurn(state);

    return state;
  }
});
