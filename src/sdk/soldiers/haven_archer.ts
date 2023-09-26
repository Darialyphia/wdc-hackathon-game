import type { SoldierData } from '.';
import { FACTIONS_IDS } from '../enums';
import { getEntityAt, isEnemy } from '../utils/entity.helpers';
import { AREA_TYPE, TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { getSurroundingCells } from '../utils/map.helpers';
import { dealSingleTargetDamage } from '../utils/skill.helpers';

export const havenArcher: SoldierData = {
  characterId: 'havenArcher',
  iconUrl: '/icons/haven_archer.gif',
  factionId: FACTIONS_IDS.HAVEN,
  name: 'Swordsman',
  cost: 2,
  initiative: 6,
  maxHp: 5,
  maxAp: 3,
  attack: 2,
  defense: 0,
  speed: 3,
  apRegenRate: 1,
  triggers: [],
  auras: [],
  skills: [
    {
      id: 'ranged_attack',
      iconUrl: '/icons/ranged_attack.png',
      name: 'Ranged attack',
      description: 'Deals damage to an enemy at range',
      cost: 0,
      range: 4,
      minRange: 2,
      targetZone: TARGET_ZONES.LINE,
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
      id: 'rain_of_arrows',
      iconUrl: '/icons/rain_of_arrows.png',
      name: 'Rain of Arrows',
      description: 'Deals damage to every enemy in a small area',
      cost: 3,
      range: 5,
      minRange: 3,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ANYWHERE,
      areaType: AREA_TYPE.SQUARE,
      areaSize: 2,
      execute({ state, caster, target }) {
        const cells = getSurroundingCells(state, target);

        cells.forEach(cell => {
          const entity = getEntityAt(state, cell);
          if (!entity) return;

          if (isEnemy(caster.owner, entity)) {
            dealSingleTargetDamage(state, state.reducer, {
              from: caster.id,
              to: entity.id,
              basePower: 1
            });
          }
        });
      }
    }
  ]
};
