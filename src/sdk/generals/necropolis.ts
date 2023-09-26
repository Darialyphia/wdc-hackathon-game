import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt } from '../utils/entity.helpers';
import { triggersLookup } from '../triggers';
import { soldiersLookup } from '../soldiers';
import { getRandomWalkableCell } from '../utils/map.helpers';
import { soldierSummonedEvent } from '../events/soldierSummoned.event';
import { necroSkeleton } from '../soldiers/necro_skeleton';

export const necroGeneral01: GeneralData = {
  characterId: 'necroGeneral01',
  iconUrl: '/icons/necro_general_01.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 10,
  maxHp: 15,
  maxAp: 5,
  attack: 3,
  defense: 1,
  speed: 3,
  apRegenRate: 1,
  summonBlueprints: [soldiersLookup.necroSkeleton, soldiersLookup.necroVampire],
  triggers: [triggersLookup.soulFeast],
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
      areaType: AREA_TYPE.RADIUS,
      execute({ state, caster, target }) {
        dealSingleTargetDamage(state, state.reducer, {
          from: caster.id,
          to: getEntityAt(state, target)!.id,
          basePower: 1
        });
      }
    },
    {
      id: 'raise-dead',
      iconUrl: '/icons/raise_dead.png',
      name: 'Raise dead',
      description: 'Summon 2 skeletons on random squares',
      cost: 3,
      minRange: 0,
      range: Infinity,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ANYWHERE,
      areaType: AREA_TYPE.RADIUS,
      execute({ state, caster }) {
        const positions = [getRandomWalkableCell(state), getRandomWalkableCell(state)];

        positions.forEach(position => {
          state.reducer(
            state,
            soldierSummonedEvent.create(
              caster.id,
              necroSkeleton.characterId,
              position,
              Math.random(),
              true
            )
          );
        });
      }
    }
  ],
  auras: []
};
