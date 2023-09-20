import { AURA_TARGET_TYPES, type Aura } from '../aura';
import { modifiersLookup } from '../modifiers';

export const divineInspiration: Aura = {
  id: 'divineInspiration',
  name: 'Divine Inspiration',
  description: 'Friendly nearby units get +1 attack',
  range: 1,
  applyToSelf: false,
  targetType: AURA_TARGET_TYPES.ALLY,
  modifier: modifiersLookup.divineInspiration
};
