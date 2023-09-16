import type { GameState } from '.';
import { MAX_ATB } from './constants';
import { ENTITY_STATES } from './entity';
import { TRIGGERS, executeTrigger } from './trigger';

const GLOBAL_ATB_INITIATIVE = 8;

const getReadyEntity = (state: GameState) => {
  const readyEntities = state.entities
    .filter(e => e.atb >= MAX_ATB && e.state === ENTITY_STATES.ALIVE)
    .sort((a, b) => b.atb - a.atb);

  return readyEntities.at(0);
};

const tickGlobalAtb = (state: GameState) => {
  state.globalAtb += GLOBAL_ATB_INITIATIVE;

  if (state.globalAtb >= MAX_ATB) {
    executeTrigger(state, TRIGGERS.NEW_TURN);
    state.globalAtb = 0;
    state.turn++;
  }
};

export const tickUntilActiveEntity = (state: GameState) => {
  tickGlobalAtb(state);

  let activeEntity = getReadyEntity(state);

  while (!activeEntity) {
    state.entities.forEach(e => {
      if (e.state !== ENTITY_STATES.ALIVE) return;
      e.atb += e.initiative;
    });
    tickGlobalAtb(state);

    activeEntity = getReadyEntity(state);
  }

  state.activeEntityId = activeEntity.id;
  activeEntity.ap = activeEntity.maxAp;
};
