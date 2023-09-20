import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { triggersLookup } from '../triggers';
import { soldiersLookup } from '../soldiers';

export const necroGeneral01: GeneralData = {
  characterId: 'necroGeneral01',
  iconUrl: '/icons/necro_general_01.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 10,
  maxHp: 20,
  maxAp: 6,
  attack: 3,
  defense: 1,
  summonBlueprints: [soldiersLookup.necroSkeleton, soldiersLookup.necroVampire],
  triggers: [triggersLookup.soulFeast],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 2,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    }
  ],
  auras: []
};
