import type { GameState } from '.';
import { ATB_STEP, MAX_ATB } from './constants';

const getReadyEntity = (state: GameState) => {
  const readyEntities = state.entities
    .filter(e => e.atb >= MAX_ATB)
    .sort((a, b) => b.atb - a.atb);

  return readyEntities.at(0);
};

export const tickUntilActiveEntity = (state: GameState) => {
  let activeEntity = getReadyEntity(state);

  while (!activeEntity) {
    state.entities.forEach(e => (e.atb += ATB_STEP));
    activeEntity = getReadyEntity(state);
  }

  state.activeEntityId = activeEntity.id;
  activeEntity.ap = activeEntity.maxAp;
};
