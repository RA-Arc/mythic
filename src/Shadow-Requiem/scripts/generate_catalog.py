import json
import os

with open("public/assets/weapons/swords_metadata.json") as f:
    meta = json.load(f)

NAMES = [
    # Row 0 (0-9)
    "Legion Apprentice Claymore", "Vanguard Broadsword", "Silver Needle Rapier", "Serpent Dune Scimitar",
    "Hooked Shadow Cleaver", "Solar Disk Sabre", "Colossus Iron Cleaver", "Sunfire Scepter Blade",
    "Cyan Rune Edge", "Flaming Dragon Sabre",
    # Row 1 (10-19)
    "Crimson Phoenix Feather", "Abyssal Cobalt Needle", "Amethyst Void Cleaver", "Golden Temple Glaive-Sword",
    "Ossuary Bone Cleaver", "Dawnbreaker Greatsword", "Bloodforged Executioner", "Jade Wind Katana",
    "Red Lacquer Shinai", "Emperor Golden Jian",
    # Row 2 (20-29)
    "Vermilion Crossguard", "Jeweled Noble Dao", "Obsidian Shadow Cleaver", "Ruby Heart Dagger",
    "Silver Willow Estoc", "Curved Bandit Scimitar", "Hextech Crystal Blade", "Golden Guard Rapier",
    "Heavy Marauder Machete", "Dual Serpent Hookblade",
    # Row 3 (30-39)
    "Legion Iron Gladius", "Silver Crest Bastard Sword", "Gilded Court Rapier", "Crimson Vanguard Sword",
    "Thief Stiletto", "Bronze Infantry Broadsword", "Twilight Void Katana", "Sunburst Star Maceblade",
    "Highland Bronze Shortsword", "Royal Crest Rapier",
    # Row 4 (40-49)
    "Blazing Ember Sickle", "Golden Sun Katana", "Spiked Fortress Crossguard", "Gilded Royal Foil",
    "Magma Forged Broadsword", "Emerald Dragon Fang", "Iron Guillotine Cleaver", "Monastery Training Shinai",
    "Ancient Ironwood Greatsword", "Void Singularity Edge",
    # Row 5 (50-59)
    "Golden Willow Dao", "Curved Tiger Talon", "Jade Lotus Ring-Blade", "Molten Flare Sabre",
    "High Sovereign Claymore", "Heavy Stonecutter Blade", "Shadow Forged Bastard", "Celestial Comet Blade",
    "Ossuary Bone Stiletto", "Sacred Phoenix Edge",
    # Row 6 (60-69)
    "Runic Iron Broadsword", "Shattered Astral Shard", "Ivory Archon Claymore", "Dragon Emperor Dao",
    "Solar Flare Falchion", "Emerald Viper Edge", "Bronze Practice Foil", "Royal Gilded Cutlass",
    "Crimson Duelist Rapier", "Primordial Void Scimitar"
]

RARITIES = [
    # Row 0
    "common", "common", "common", "rare", "rare", "rare", "epic", "epic", "epic", "legendary",
    # Row 1
    "epic", "epic", "legendary", "epic", "rare", "legendary", "epic", "rare", "common", "legendary",
    # Row 2
    "rare", "rare", "epic", "rare", "common", "rare", "epic", "rare", "common", "epic",
    # Row 3
    "common", "rare", "rare", "rare", "common", "common", "legendary", "epic", "common", "rare",
    # Row 4
    "epic", "rare", "rare", "common", "epic", "epic", "rare", "common", "epic", "mythic",
    # Row 5
    "rare", "rare", "epic", "epic", "legendary", "rare", "epic", "legendary", "common", "legendary",
    # Row 6
    "rare", "legendary", "legendary", "legendary", "epic", "rare", "common", "rare", "epic", "mythic"
]

FACTIONS = [
    # Row 0
    "legion", "legion", "heralds", "dynasty", "dynasty", "dynasty", "legion", "dynasty", "heralds", "dynasty",
    # Row 1
    "dynasty", "heralds", "heralds", "dynasty", "legion", "legion", "legion", "dynasty", "dynasty", "dynasty",
    # Row 2
    "legion", "dynasty", "heralds", "dynasty", "heralds", "dynasty", "heralds", "legion", "legion", "dynasty",
    # Row 3
    "legion", "legion", "heralds", "legion", "heralds", "legion", "heralds", "legion", "legion", "dynasty",
    # Row 4
    "dynasty", "dynasty", "legion", "heralds", "legion", "dynasty", "legion", "dynasty", "legion", "heralds",
    # Row 5
    "dynasty", "dynasty", "dynasty", "dynasty", "legion", "legion", "heralds", "heralds", "legion", "dynasty",
    # Row 6
    "legion", "heralds", "legion", "dynasty", "dynasty", "dynasty", "legion", "dynasty", "heralds", "heralds"
]

WEAPON_TYPES = [
    "greatsword" if r == "legion" and i % 2 == 0 else ("katana" if r in ("dynasty", "heralds") else "greatsword")
    for i, r in enumerate(FACTIONS)
]

output_lines = [
    "import { GearItem, WeaponType, GearRarity, Faction } from './types';",
    "",
    "export interface MarketplaceSword extends GearItem {",
    "  swordIndex: number;",
    "  hiltOffset: [number, number];",
    "  tipOffset: [number, number];",
    "  spriteUrl: string;",
    "  sprite32Url: string;",
    "  priceGold: number;",
    "  priceGems: number;",
    "  shadowAffinityName: string;",
    "}",
    "",
    "export const SWORD_MARKETPLACE_CATALOG: MarketplaceSword[] = ["
]

for sid in range(70):
    m = meta[sid]
    name = NAMES[sid]
    rarity = RARITIES[sid]
    faction = FACTIONS[sid]
    wtype = WEAPON_TYPES[sid]
    
    if rarity == "common":
        level = 1
        base_power = 70 + (sid % 5) * 4
        atk = 25 + (sid % 5) * 3
        shadow = 18 + (sid % 5) * 2
        crit = 0.16 + (sid % 4) * 0.02
        price_gold = 250 + (sid % 5) * 50
        price_gems = 0
        perk = "Iron Edge"
    elif rarity == "rare":
        level = 3
        base_power = 105 + (sid % 7) * 5
        atk = 48 + (sid % 7) * 4
        shadow = 42 + (sid % 7) * 4
        crit = 0.22 + (sid % 4) * 0.03
        price_gold = 650 + (sid % 7) * 120
        price_gems = 0
        perk = "Shadow Bleed"
    elif rarity == "epic":
        level = 5
        base_power = 145 + (sid % 8) * 7
        atk = 80 + (sid % 8) * 6
        shadow = 78 + (sid % 8) * 6
        crit = 0.28 + (sid % 5) * 0.03
        price_gold = 1600 + (sid % 8) * 250
        price_gems = 15
        perk = "Critical Surge"
    elif rarity == "legendary":
        level = 8
        base_power = 195 + (sid % 6) * 10
        atk = 125 + (sid % 6) * 8
        shadow = 125 + (sid % 6) * 9
        crit = 0.35 + (sid % 4) * 0.03
        price_gold = 3800 + (sid % 6) * 450
        price_gems = 45
        perk = "Lifesteal Siphon"
    else:  # mythic
        level = 10
        base_power = 260 + (sid % 4) * 15
        atk = 180 + (sid % 4) * 10
        shadow = 185 + (sid % 4) * 12
        crit = 0.42 + (sid % 3) * 0.03
        price_gold = 6800
        price_gems = 90
        perk = "Primordial Cataclysm"

    glow_color = m["accent"] if m["accent"] != "#2a1d0d" else m["dominant"]
    if glow_color == "#2a1d0d":
        glow_color = "#38bdf8"

    item_str = f"""  {{
    id: 'sword_market_{sid}',
    name: '{name}',
    slot: 'weapon',
    rarity: '{rarity}' as GearRarity,
    faction: '{faction}' as Faction,
    weaponType: '{wtype}' as WeaponType,
    level: {level},
    basePower: {base_power},
    attackBonus: {atk},
    shadowBonus: {shadow},
    critChance: {round(crit, 2)},
    description: 'A finely tempered 32x32 pixel art blade forged in the fires of the shadow rift.',
    lore: 'Cut out from the master artisan armory collection. Its edge carries the unbroken spirit of mortal and void masters alike.',
    colorScheme: {{
      primary: '{m["dominant"]}',
      secondary: '{m["accent"]}',
      glow: '{glow_color}',
    }},
    perks: ['{perk}'],
    iconName: 'Swords',
    swordIndex: {sid},
    hiltOffset: [{m["hilt"][0]}, {m["hilt"][1]}],
    tipOffset: [{m["tip"][0]}, {m["tip"][1]}],
    spriteUrl: '/assets/weapons/items/sword_{sid}.png',
    sprite32Url: '/assets/weapons/items/sword_{sid}_32.png',
    priceGold: {price_gold},
    priceGems: {price_gems},
    shadowAffinityName: '{faction.capitalize()} Mastery',
  }},"""
    output_lines.append(item_str)

output_lines.append("];")
output_lines.append("")

with open("src/game/swordsCatalog.ts", "w") as f:
    f.write("\n".join(output_lines))

print("Created src/game/swordsCatalog.ts successfully!")
