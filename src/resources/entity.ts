import type { CharacterId } from '@/game-logic/entity';
import type { FactionId } from './enums';
import type { SkillData } from './skills';

export type EntityData = {
  factionId: FactionId;
  characterId: CharacterId;
  name: string;
  skills: SkillData[];
  maxHp: number;
  attack: number;
  defense: number;
  initiative: number;
};
