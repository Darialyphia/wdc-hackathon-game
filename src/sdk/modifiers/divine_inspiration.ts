import type { ModifierData } from '../modifier';

export const divineInspiration: ModifierData = {
  id: 'divineInspiration',
  name: 'Divine Inspiration',
  description: 'This unit has +1 defense',
  duration: Infinity,
  execute(state, entity) {
    entity.defense += 1;
  },
  cleanup(state, entity) {
    entity.defense -= 1;
  }
};
