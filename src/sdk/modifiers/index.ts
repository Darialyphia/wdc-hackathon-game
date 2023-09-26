import type { ModifierData, ModifierId } from '../modifier';
import { divineInspiration } from './divine_inspiration';
import { callToArms } from './call_to_arms';

export const modifiersLookup = {
  divineInspiration,
  callToArms
} satisfies Record<ModifierId, ModifierData>;

Object.entries(modifiersLookup).forEach(([k, v]) => {
  if (k !== v.id) {
    console.warn(`[Modifiers Lookup]: key and id mismatch: ${k}, ${v.id}`);
  }
});
