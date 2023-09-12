import type { CharacterId } from '../game-logic/entity';
import type { FactionId } from './enums';
import type { SkillId } from './skills';

export type EntityData = {
  factionId: FactionId;
  characterId: CharacterId;
  iconUrl: string;
  name: string;
  skills: SkillId[];
  maxHp: number;
  attack: number;
  defense: number;
  initiative: number;
  spriteId: string;
};
