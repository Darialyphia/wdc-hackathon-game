import type { ModifierData, ModifierId } from '../modifier';
import { divineInspiration } from './divine_inspiration';

export const modifiersLookup = {
  divineInspiration
} satisfies Record<ModifierId, ModifierData>;

Object.entries(modifiersLookup).forEach(([k, v]) => {
  if (k !== v.id) {
    console.warn(`[Modifiers Lookup]: key and id mismatch: ${k}, ${v.id}`);
  }
});
