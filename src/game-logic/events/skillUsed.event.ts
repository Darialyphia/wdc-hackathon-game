import { type SkillId } from '../../resources/skills';
import { defineEvent } from '.';
import type { EntityId } from '../entity';
import { getEntityById } from '../utils/entity.helpers';
import { getSkillById } from '../utils/skill.helper';
import { createSpritesheetFrameObject } from '../../utils/sprite-utils';

export const SKILL_USED = 'skill_used';

export type SkillUsedEvent = {
  type: typeof SKILL_USED;
  payload: { sourceId: EntityId; skillId: SkillId };
};

export const skillUsedEvent = defineEvent({
  create: (sourceId: EntityId, skillId: SkillId): SkillUsedEvent => ({
    type: SKILL_USED,
    payload: { sourceId, skillId }
  }),
  execute: (state, { sourceId, skillId }) => {
    // just here for event logging purpose
    const entity = getEntityById(state, sourceId)!;
    const skill = getSkillById(skillId)!;
    entity.ap -= skill.cost;

    return state;
  },

  sequence: (state, { payload }, { assets, sprites }) => {
    return new Promise(resolve => {
      const entity = getEntityById(state, payload.sourceId)!;

      const ap = entity.ap;
      gsap.to(entity, {
        duration: 0.3,
        ease: Power2.easeOut,
        delay: 0,
        onComplete: () => {
          // set back hp to old value because the game reducer will decrease it as well
          entity.ap = ap;
        },
        ap: entity.ap - getSkillById(payload.skillId)!.cost
      });

      // play attack animation
      const sprite = sprites.resolve(payload.sourceId);
      if (!sprite) return resolve();

      const sheet = assets.resolveSprite(entity.blueprint.spriteId);

      sprite.textures = createSpritesheetFrameObject('attacking', sheet);
      sprite.gotoAndPlay(0);
      sprite.loop = false;
      sprite.onComplete = () => {
        sprite.textures = createSpritesheetFrameObject('idle', sheet);
        sprite.gotoAndPlay(0);
        sprite.loop = true;
        sprite.onComplete = undefined;
        resolve();
      };
    });
  }
});
