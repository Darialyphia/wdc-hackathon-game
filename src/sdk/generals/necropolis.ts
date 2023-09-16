import type { GeneralData } from '.';
import { dealSingleTargetDamage } from '../utils/skill.helpers';
import { TARGET_TYPES, TARGET_ZONES } from '../utils/entityData';
import { FACTIONS_IDS } from '../enums';
import { TRIGGERS } from '../trigger';
import { dealDamageEvent } from '../events/dealDamage.event';
import { getEnemyGeneral, getEntityAt } from '../utils/entity.helpers';

export const necroGeneral: GeneralData = {
  characterId: 'necro_general_01',
  spriteId: 'necroGeneral01',
  iconUrl: '/icons/necro_general_01.gif',
  factionId: FACTIONS_IDS.NECRO,
  name: 'Necromancer',
  initiative: 10,
  maxHp: 20,
  attack: 3,
  defense: 1,
  triggers: [
    {
      on: TRIGGERS.NEW_TURN,
      execute({ state, reducer, from }) {
        console.log('necromancer new turn trigger', state.turn);
        reducer(
          state,
          dealDamageEvent.create(from.id, getEnemyGeneral(state, from.owner).id, 1)
        );
        console.log('new hp: ', getEnemyGeneral(state, from.owner).hp);
      }
    }
  ],
  skills: [
    {
      id: 'melee_attack',
      iconUrl: '/icons/melee_attack.png',
      name: 'Melee attack',
      cost: 2,
      minRange: 0,
      range: 1,
      targetZone: TARGET_ZONES.RADIUS,
      targetType: TARGET_TYPES.ENEMY,
      execute(ctx) {
        dealSingleTargetDamage(ctx, {
          to: getEntityAt(ctx.state, ctx.target)!.id,
          basePower: 1
        });
      }
    }
  ]
};
