export type RPGRace = "Dwarf" | "Human" | "Elf" | "Iksar";
export type RPGClass = "Paladin" | "Cleric" | "Enchanter" | "Shadow Knight";

export interface SkillProfile {
  name: string;
  level: number;
  currentXp: number;
  maxXp: number;
}

export const BASE_RACE_STATS: Record<RPGRace, Record<string, number>> = {
  Dwarf: { Strength: 90, Stamina: 100, Agility: 70, Wisdom: 80, Intelligence: 60 },
  Human: { Strength: 75, Stamina: 75, Agility: 75, Wisdom: 75, Intelligence: 75 },
  Elf:   { Strength: 65, Stamina: 65, Agility: 95, Wisdom: 75, Intelligence: 85 },
  Iksar: { Strength: 70, Stamina: 85, Agility: 85, Wisdom: 70, Intelligence: 70 }
};

export class SkillEngine {
  selectedRace: RPGRace = "Human";
  selectedClass: RPGClass = "Paladin";

  // Dynamic EverQuest Progressive Skill Tracks
  skills: Record<string, SkillProfile> = {
    "1H Slashing (Swords)": { name: "1H Slashing (Swords)", level: 1, currentXp: 0, maxXp: 30 },
    "1H Blunt (Hammers)":  { name: "1H Blunt (Hammers)", level: 1, currentXp: 0, maxXp: 30 },
    "2H Offense (Axes)":   { name: "2H Offense (Axes)", level: 1, currentXp: 0, maxXp: 35 },
    "Archery (Bows)":      { name: "Archery (Bows)", level: 1, currentXp: 0, maxXp: 40 },
    "Defense (Parry/Block)": { name: "Defense (Parry/Block)", level: 1, currentXp: 0, maxXp: 25 }
  };

  // Ticks weapon experience up upon successful engagement connections
  trainSkill(skillName: string, logger: any, popText: any, heroSprite: any): boolean {
    const track = this.skills[skillName];
    if (!track) return false;

    track.currentXp += 1;
    if (track.currentXp >= track.maxXp) {
      track.currentXp = 0;
      track.level += 1;
      // Exponential EQ curve modifier: Escalates the training requirement for the next level
      track.maxXp = Math.floor(track.maxXp * 1.55);

      logger.printLine(`Your skill in ${skillName} has increased! (${track.level})`, "#ffff00");
      popText(`${track.level} ${skillName.split(" ")[0]}!`, heroSprite.x, heroSprite.y - 70, "#ffff00", 18);
      return true;
    }
    return false;
  }

  // Translates skill masteries directly into dynamic damage or defense modifiers
  getSkillDamageBonus(): number {
    let total = 0;
    Object.values(this.skills).forEach(s => { if (s.name !== "Defense (Parry/Block)") total += s.level * 2; });
    return total;
  }

  getSkillDefenseBonus(): number {
    return this.skills["Defense (Parry/Block)"].level * 3;
  }
}
