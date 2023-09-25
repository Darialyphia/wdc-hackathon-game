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
  state.globalAtb += GLOBAL_ATB_INITIATIVE;

  if (state.globalAtb >= MAX_ATB) {
    executeTrigger(state, { type: 'new_turn', payload: {} });
    state.globalAtb = 0;
    state.entities.forEach(e => {
      e.triggers = e.triggers
        .map(trigger => ({
          ...trigger,
          duration: trigger.duration - 1
        }))
        .filter(trigger => trigger.duration !== 0);

      e.modifiers = e.modifiers.map(modifier => ({
        ...modifier,
        duration: modifier.duration - 1
      }));

      e.modifiers.forEach(modifier => {
        if (modifier.duration === 0) {
          removeModifier(state, e, modifier);
        }
      });
    });

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
