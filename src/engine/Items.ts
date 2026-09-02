export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type WpnType = "sword" | "hammer" | "axe" | "bow" | "armor";

export interface RPGItem {
  name: string;
  slot: "head" | "face" | "neck" | "shoulder" | "chest" | "back" | "wrist" | "hands" | "waist" | "legs" | "finger1" | "finger2" | "ear1" | "ear2" | "primaryWpn" | "offHandWpn";
  wpnType: WpnType;
  rarity: Rarity;
  hpBonus?: number;
  damageBonus?: number;
  haste?: boolean;
  flavor: string;
}

export const COLOR_MAP: Record<Rarity, string> = {
  Common: "#ffffff", Uncommon: "#22cc22", Rare: "#3399ff", Epic: "#b57cff", Legendary: "#ff9900"
};

export const ITEM_DATABASE: Record<string, RPGItem> = {
  "Rusty Gladius": { name: "Rusty Gladius", slot: "primaryWpn", wpnType: "sword", rarity: "Common", damageBonus: 4, flavor: "Pitted with oxidation." },
  "Cloth Cap": { name: "Cloth Cap", slot: "head", wpnType: "armor", rarity: "Common", hpBonus: 5, flavor: "Tattered fabric." },
  "Cracked Bone Ring": { name: "Cracked Bone Ring", slot: "finger1", wpnType: "armor", rarity: "Common", damageBonus: 1, flavor: "Carved rudely." },
  "Gnoll Leather Shoulderpads": { name: "Gnoll Leather Shoulderpads", slot: "shoulder", wpnType: "armor", rarity: "Uncommon", hpBonus: 15, flavor: "Smells of moss." },
  "Polished Ivory Necklace": { name: "Polished Ivory Necklace", slot: "neck", wpnType: "armor", rarity: "Uncommon", hpBonus: 10, damageBonus: 2, flavor: "Hums with low energy." },
  "Barbaric Granite Mallet": { name: "Barbaric Granite Mallet", slot: "primaryWpn", wpnType: "hammer", rarity: "Rare", damageBonus: 14, flavor: "Heavy stone head." },
  "Shiny Brass Shield Patch": { name: "Shiny Brass Shield Patch", slot: "back", wpnType: "armor", rarity: "Rare", hpBonus: 35, damageBonus: 3, flavor: "Reflects firelight." },
  "Flowing Silk Sash": { name: "Flowing Silk Sash", slot: "waist", wpnType: "armor", rarity: "Epic", haste: true, flavor: "Accelerates your swing." },
  "Rubicite Breastplate Core": { name: "Rubicite Breastplate Core", slot: "chest", wpnType: "armor", rarity: "Epic", hpBonus: 90, flavor: "Dark blood-red alloy ore." },
  "Eldritch Crescent Axe": { name: "Eldritch Crescent Axe", slot: "primaryWpn", wpnType: "axe", rarity: "Epic", damageBonus: 22, flavor: "Blades glow purple." },
  "Sylvan Composite Bow": { name: "Sylvan Composite Bow", slot: "primaryWpn", wpnType: "bow", rarity: "Epic", damageBonus: 18, flavor: "Flexes with deep mechanical power." },
  "Fiery Avenger Shard": { name: "Fiery Avenger Shard", slot: "head", wpnType: "armor", rarity: "Legendary", hpBonus: 150, damageBonus: 20, flavor: "Searing holy relic." },
  "Cloak of Flames": { name: "Cloak of Flames", slot: "back", wpnType: "armor", rarity: "Legendary", hpBonus: 100, haste: true, damageBonus: 10, flavor: "Pure elemental rage." }
};

export function calculateLootDrop(isBoss: boolean, heroLevel: number): RPGItem {
  const roll = Math.random(); let rarity: Rarity = "Common";
  if (isBoss) { rarity = roll < 0.15 ? "Legendary" : roll < 0.45 ? "Epic" : "Rare"; }
  else { rarity = heroLevel >= 8 && roll < 0.02 ? "Epic" : heroLevel >= 5 && roll < 0.08 ? "Rare" : roll < 0.30 ? "Uncommon" : "Common"; }
  const matches = Object.values(ITEM_DATABASE).filter(item => item.rarity === rarity);
  return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : ITEM_DATABASE["Cloth Cap"];
}
