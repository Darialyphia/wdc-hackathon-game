import type { Trigger, TriggerId } from '../trigger';
import { soulFeast } from './soul_feast';

export const triggersLookup = {
  soulFeast
} satisfies Record<TriggerId, Trigger>;

Object.entries(triggersLookup).forEach(([k, v]) => {
  if (k !== v.id) {
    console.warn(`[Triggers Lookup]: key and id mismatch: ${k}, ${v.id}`);
  }
});
