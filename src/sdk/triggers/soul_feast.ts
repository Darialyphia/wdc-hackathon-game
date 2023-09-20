import { ENTITY_DIED } from '../events/entityDied.event';
import type { Trigger } from '../trigger';
import { healSingleTarget } from '../utils/skill.helpers';

export const soulFeast: Trigger = {
  id: 'soulFeast',
  on: ENTITY_DIED,
  name: 'Soul feast',
  description: 'Whenever a unit dies, recover 1 HP',
  duration: Infinity,
  execute({ state, reducer, from }) {
    healSingleTarget(state, reducer, { from: from.id, to: from.id, baseAmount: 1 });
  }
};
