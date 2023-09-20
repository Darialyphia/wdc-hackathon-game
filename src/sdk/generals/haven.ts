import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { AURA_TARGET_TYPES } from '../aura';
import { havenSwordsman } from '../soldiers/havenSwordsman';
import { havenArcher } from '../soldiers/havenArcher';

export const havenGeneral: GeneralData = {
  characterId: 'haven_general_01',
  spriteId: 'havenGeneral01',
  iconUrl: '/icons/haven_general_01.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Paladin',
  initiative: 10,
  maxHp: 20,
  maxAp: 4,
  attack: 3,
  defense: 1,
  summonBlueprints: [havenSwordsman, havenArcher],
  triggers: [],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      description: 'Deals damage to a close enemy',
      cost: 1,
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
  auras: [
    {
      id: 'divine_inspiration',
      range: 1,
      name: 'Divine Inspiration',
      description: 'Friendly units around this one get +1 attack',
      applyToSelf: false,
      targetType: AURA_TARGET_TYPES.ALLY,
      execute(state, entity) {
        entity.attack += 1;
      },
      cleanup(state, entity) {
        entity.attack -= 1;
      }
    }
  ]
};
