import type { Aura, AuraId } from '../aura';
import { divineInspiration } from './divine_inspiration';

export const aurasLookup = {
  divineInspiration
} satisfies Record<AuraId, Aura>;

Object.entries(aurasLookup).forEach(([k, v]) => {
  if (k !== v.id) {
    console.warn(`[Auras Lookup]: key and id mismatch: ${k}, ${v.id}`);
  }
});
