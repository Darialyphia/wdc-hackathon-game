import type { GameState } from '.';
import { MAX_ATB } from './constants';
import { ENTITY_STATES } from './entity';

const getReadyEntity = (state: GameState) => {
  const readyEntities = state.entities
    .filter(e => e.atb >= MAX_ATB && e.state === ENTITY_STATES.ALIVE)
    .sort((a, b) => b.atb - a.atb);

  return readyEntities.at(0);
};

export const tickUntilActiveEntity = (state: GameState) => {
  let activeEntity = getReadyEntity(state);

  while (!activeEntity) {
    state.entities.forEach(e => {
      if (e.state !== ENTITY_STATES.ALIVE) return;
      e.atb += e.initiative;
    });
    activeEntity = getReadyEntity(state);
  }

  state.activeEntityId = activeEntity.id;
  activeEntity.ap = activeEntity.maxAp;
};
