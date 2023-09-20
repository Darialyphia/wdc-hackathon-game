import type { ModifierData } from '../modifier';

export const divineInspiration: ModifierData = {
  id: 'divineInspiration',
  name: 'Divine Inspiration',
  description: 'This unit has +1 attack',
  duration: Infinity,
  execute(state, entity) {
    entity.attack += 1;
  },
  cleanup(state, entity) {
    entity.attack -= 1;
  }
};
