import type { GameState } from '.';
import { MAX_ATB } from './constants';
import { ENTITY_STATES } from './entity';
import { removeModifier } from './modifier';
import { executeTrigger } from './trigger';

const GLOBAL_ATB_INITIATIVE = 8;

const getReadyEntity = (state: GameState) => {
  const readyEntities = state.entities
    .filter(e => e.atb >= MAX_ATB && e.state === ENTITY_STATES.ALIVE)
    .sort((a, b) => b.atb - a.atb);

  return readyEntities.at(0);
};

const tickGlobalAtb = (state: GameState) => {
  const oldAtb = state.globalAtb;
  state.globalAtb = Math.min(MAX_ATB, state.globalAtb + GLOBAL_ATB_INITIATIVE);
  const diff = state.globalAtb - oldAtb;
  const diffPercentage = diff / MAX_ATB;

  state.entities.forEach(e => {
    if (e.state !== ENTITY_STATES.ALIVE) return;

    e.triggers = e.triggers
      .map(trigger => ({
        ...trigger,
        duration: trigger.duration - diffPercentage
      }))
      .filter(trigger => trigger.duration !== 0);

    e.modifiers.forEach(modifier => {
      modifier.duration -= diffPercentage;
      if (modifier.duration <= 0) {
        removeModifier(state, e, modifier);
      }
    });
  });

  if (state.globalAtb === MAX_ATB) {
    executeTrigger(state, { type: 'new_turn', payload: {} });
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
  activeEntity.ap = Math.min(
    activeEntity.maxAp,
    activeEntity.ap + activeEntity.apRegenRate
  );
};
