import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt, isAlly } from '../utils/entity.helpers';
import { aurasLookup } from '../auras';
import { soldiersLookup } from '../soldiers';
import { addModifier } from '../modifier';
import { modifiersLookup } from '../modifiers';
import { modifierAddedEvent } from '../events/modifierAdded.event';

export const havenGeneral01: GeneralData = {
  characterId: 'havenGeneral01',
  iconUrl: '/icons/haven_general_01.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 10,
  maxHp: 15,
  maxAp: 5,
  attack: 3,
  defense: 1,
  speed: 3,
  apRegenRate: 1,
  summonBlueprints: [soldiersLookup.havenSwordsman, soldiersLookup.havenArcher],
  auras: [aurasLookup.divineInspiration],
  triggers: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 0,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      areaType: AREA_TYPE.SQUARE,
      areaSize: 1,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    },
    {
      id: 'call_to_arms',
      iconUrl: '/icons/call_to_arms.png',
      name: 'Call to arms',
      description: 'Increase all allies initiative for 3 turns',
      cost: 3,
      minRange: 0,
      range: Infinity,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ALLY,
      areaType: AREA_TYPE.SQUARE,
      areaSize: Infinity,
      execute({ state, caster }) {
        state.reducer(
          state,
          modifierAddedEvent.create(
            caster.id,
            state.entities.filter(entity => isAlly(caster.owner, entity)).map(e => e.id),
            modifiersLookup.callToArms.id
          )
        );
      }
    }
  ]
};
