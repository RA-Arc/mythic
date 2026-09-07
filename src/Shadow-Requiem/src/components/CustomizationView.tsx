import React, { useState } from 'react';
import { PlayerProfile, GearItem, GearSlot, WeaponType, Faction } from '../game/types';
import { upgradeGearItem } from '../game/state';
import { PERK_CATALOG } from '../game/armor';
import { SoundButton } from './SoundButton';
import { 
  Shield, 
  Sword, 
  Sparkles, 
  Zap, 
  Flame, 
  HeartPulse, 
  Crown, 
  Crosshair, 
  ArrowUpCircle, 
  Palette, 
  Check,
  CheckCircle2
} from 'lucide-react';

interface CustomizationViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onBack: () => void;
}

const COLOR_PALETTES = [
  { id: 'shadow_obsidian', name: 'Shadow Obsidian', primary: '#14141d', secondary: '#4f46e5', glow: '#a855f7' },
  { id: 'imperial_jade', name: 'Dynasty Jade', primary: '#042f2e', secondary: '#10b981', glow: '#34d399' },
  { id: 'crimson_blood', name: 'Abyssal Crimson', primary: '#450a0a', secondary: '#ef4444', glow: '#f87171' },
  { id: 'celestial_gold', name: 'Legion Aureate', primary: '#1e293b', secondary: '#f59e0b', glow: '#fbbf24' },
  { id: 'frost_silver', name: 'Glacial Herald', primary: '#0f172a', secondary: '#0284c7', glow: '#38bdf8' },
];

export const CustomizationView: React.FC<CustomizationViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [activeSlot, setActiveSlot] = useState<GearSlot>('weapon');
  const [selectedItem, setSelectedItem] = useState<GearItem>(profile.equipped.weapon);
  const [customColorIdx, setCustomColorIdx] = useState<number>(0);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Equip an item from inventory
  const handleEquip = (item: GearItem) => {
    const updatedEquipped = { ...profile.equipped, [item.slot]: item };
    onUpdateProfile({
      ...profile,
      equipped: updatedEquipped,
    });
    setSelectedItem(item);
  };

  // Upgrade selected item with gold and shadow cores
  const handleUpgrade = (item: GearItem) => {
    const goldCost = item.level * 180;
    const coreCost = item.level * 15;

    if (profile.gold < goldCost || profile.shadowCores < coreCost) {
      setWarningMsg(`Insufficient resources! Need ${goldCost} Gold and ${coreCost} Shadow Cores.`);
      setTimeout(() => setWarningMsg(null), 3500);
      return;
    }

    const upgraded = upgradeGearItem(item);
    const updatedInventory = profile.inventory.map((inv) => (inv.id === item.id ? upgraded : inv));
    const updatedEquipped = {
      ...profile.equipped,
      [item.slot]: profile.equipped[item.slot].id === item.id ? upgraded : profile.equipped[item.slot],
    };

    onUpdateProfile({
      ...profile,
      gold: profile.gold - goldCost,
      shadowCores: profile.shadowCores - coreCost,
      equipped: updatedEquipped,
      inventory: updatedInventory,
    });
    setSelectedItem(upgraded);
  };

  // Apply custom visual dye to equipped gear
  const handleApplyDye = (palette: typeof COLOR_PALETTES[0]) => {
    const targetItem = profile.equipped[activeSlot];
    const dyedItem: GearItem = {
      ...targetItem,
      colorScheme: {
        primary: palette.primary,
        secondary: palette.secondary,
        glow: palette.glow,
      },
    };

    const updatedEquipped = { ...profile.equipped, [activeSlot]: dyedItem };
    const updatedInventory = profile.inventory.map((inv) => (inv.id === dyedItem.id ? dyedItem : inv));

    onUpdateProfile({
      ...profile,
      equipped: updatedEquipped,
      inventory: updatedInventory,
    });
    setSelectedItem(dyedItem);
  };

  // Filter inventory for current active gear slot
  const slotItems = profile.inventory.filter((item) => item.slot === activeSlot);

  // Total stat calculations
  const totalPower = 
    profile.equipped.weapon.basePower +
    profile.equipped.armor.basePower +
    profile.equipped.helm.basePower +
    profile.equipped.ranged.basePower;

  return (
    <div id="customization-view" className="w-full h-full flex flex-col bg-[#090a10] text-neutral-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-[#0d0e17]/95 border-b border-neutral-800 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-4">
          <button 
            id="customization-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm font-semibold border border-neutral-700 text-neutral-200 transition-all"
          >
            ← Return to Realm
          </button>
          <div>
            <h1 className="font-cinzel text-xl font-bold text-amber-400">Armory & Customization</h1>
            <p className="text-xs text-neutral-400">Equip ancient blades, tune faction fighting styles, and forge shadow artifacts.</p>
          </div>
        </div>

        {/* Header Right: Sound & Currency Display */}
        <div className="flex items-center gap-3">
          <SoundButton id="armory-sound-btn" size="sm" />
          <div className="flex items-center gap-5 bg-black/60 px-4 py-2 rounded-xl border border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <span>🪙</span> {profile.gold} Gold
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
              <span>🔮</span> {profile.shadowCores} Shadow Cores
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span>💎</span> {profile.gems} Gems
            </div>
          </div>
        </div>
      </div>

      {/* Main Armory Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Character Stance & Equipped Slots (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Fighter Overview Card */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden shadow-xl">
            {/* Background Aura */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${profile.equipped.weapon.colorScheme.glow}, transparent 70%)` }}
            />

            <div className="w-full flex justify-between items-center mb-3">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Level {profile.level} Duelist</span>
                <h2 className="font-cinzel text-lg font-black text-white">{profile.name}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 uppercase">Shadow Power</span>
                <div className="font-cinzel text-base font-bold text-indigo-400">{totalPower}</div>
              </div>
            </div>

            {/* Visual Silhouette Showcase */}
            <div className="w-full h-48 bg-black/40 border border-neutral-800/80 rounded-xl relative flex items-center justify-center overflow-hidden">
              <div className="relative flex flex-col items-center">
                {/* Glowing weapon icon preview */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 mb-2 shadow-2xl transition-all"
                  style={{
                    backgroundColor: profile.equipped.weapon.colorScheme.primary,
                    borderColor: profile.equipped.weapon.colorScheme.glow,
                    boxShadow: `0 0 25px ${profile.equipped.weapon.colorScheme.glow}80`,
                  }}
                >
                  <Sword className="w-8 h-8" style={{ color: profile.equipped.weapon.colorScheme.glow }} />
                </div>
                <span className="font-cinzel text-sm font-bold text-amber-300">{profile.equipped.weapon.name}</span>
                <span className="text-[11px] text-neutral-400 capitalize">Style: {profile.equipped.weapon.faction} Martial Stance</span>
              </div>
            </div>

            {/* Equipped Slots Row */}
            <div className="grid grid-cols-4 gap-2 w-full mt-4">
              {(['weapon', 'armor', 'helm', 'ranged'] as GearSlot[]).map((slot) => {
                const item = profile.equipped[slot];
                const isSelected = activeSlot === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      setActiveSlot(slot);
                      setSelectedItem(item);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20' 
                        : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-neutral-400">{slot}</span>
                    <div className="w-7 h-7 my-1 rounded flex items-center justify-center" style={{ backgroundColor: item.colorScheme.glow + '30' }}>
                      {slot === 'weapon' && <Sword className="w-4 h-4 text-amber-400" />}
                      {slot === 'armor' && <Shield className="w-4 h-4 text-indigo-400" />}
                      {slot === 'helm' && <Crown className="w-4 h-4 text-emerald-400" />}
                      {slot === 'ranged' && <Crosshair className="w-4 h-4 text-rose-400" />}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-300 truncate w-full text-center">
                      Lv.{item.level}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Armor Dyes & Weapon Glow Customization */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">Armor & Weapon Dyes</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Infuse your active gear slot ({activeSlot}) with legendary faction pigments.</p>
            <div className="grid grid-cols-1 gap-2">
              {COLOR_PALETTES.map((palette, idx) => (
                <button
                  key={palette.id}
                  onClick={() => {
                    setCustomColorIdx(idx);
                    handleApplyDye(palette);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                    profile.equipped[activeSlot].colorScheme.glow === palette.glow
                      ? 'bg-neutral-800 border-amber-400 text-white'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: palette.glow }} />
                    <span className="text-xs font-semibold">{palette.name}</span>
                  </div>
                  {profile.equipped[activeSlot].colorScheme.glow === palette.glow && (
                    <Check className="w-4 h-4 text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Slot Inventory & Item Inspector (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Inventory Items Grid for Selected Slot */}
          <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-400 uppercase tracking-wider">
                  Select {activeSlot}
                </h3>
                <p className="text-xs text-neutral-400">Showing all forged weapons and armor in your shadow vault.</p>
              </div>
              <span className="text-xs font-medium text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                {slotItems.length} Items Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {slotItems.map((item) => {
                const isEquipped = profile.equipped[item.slot].id === item.id;
                const isInspected = selectedItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isInspected 
                        ? 'bg-neutral-800/90 border-amber-400 shadow-md shadow-amber-500/10' 
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          item.rarity === 'mythic' ? 'bg-rose-950/80 border-rose-700 text-rose-300' :
                          item.rarity === 'legendary' ? 'bg-amber-950/80 border-amber-700 text-amber-300' :
                          item.rarity === 'epic' ? 'bg-purple-950/80 border-purple-700 text-purple-300' :
                          'bg-blue-950/80 border-blue-700 text-blue-300'
                        }`}>
                          {item.rarity}
                        </span>
                        <span className="text-xs font-bold text-amber-400">Lv.{item.level}</span>
                      </div>

                      <h4 className="font-cinzel text-sm font-bold text-white mb-1">{item.name}</h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                      <span className="text-[11px] font-semibold text-indigo-300 capitalize">
                        {item.faction}
                      </span>
                      {isEquipped ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[11px] font-bold transition-all"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Item Detail Inspector & Forge Upgrade */}
          {selectedItem && (
            <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">{selectedItem.slot}</span>
                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs font-bold capitalize text-indigo-400">{selectedItem.faction} Faction</span>
                </div>
                <h3 className="font-cinzel text-xl font-black text-white mb-2">{selectedItem.name}</h3>
                <p className="text-xs text-neutral-300 mb-3">{selectedItem.lore}</p>

                {/* Stat Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                    <span className="text-[10px] uppercase text-neutral-400">Power Rating</span>
                    <div className="font-cinzel text-base font-bold text-amber-400">{selectedItem.basePower}</div>
                  </div>
                  {selectedItem.attackBonus !== undefined && (
                    <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] uppercase text-neutral-400">Attack Bonus</span>
                      <div className="font-cinzel text-base font-bold text-rose-400">+{selectedItem.attackBonus}</div>
                    </div>
                  )}
                  {selectedItem.defenseBonus !== undefined && (
                    <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] uppercase text-neutral-400">Defense Bonus</span>
                      <div className="font-cinzel text-base font-bold text-emerald-400">+{selectedItem.defenseBonus}</div>
                    </div>
                  )}
                  {selectedItem.critChance !== undefined && (
                    <div className="bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] uppercase text-neutral-400">Crit Rate</span>
                      <div className="font-cinzel text-base font-bold text-purple-400">{Math.round(selectedItem.critChance * 100)}%</div>
                    </div>
                  )}
                </div>

                {/* Perks Attached */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-neutral-400 tracking-wider mb-2">Socketed Shadow Perks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.perks.map((perkId) => {
                      const perk = PERK_CATALOG.find((p) => p.id === perkId);
                      if (!perk) return null;
                      return (
                        <div key={perkId} className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/80 flex items-center gap-2 text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <div>
                            <strong className="text-indigo-200">{perk.name}:</strong>{' '}
                            <span className="text-neutral-300">{perk.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upgrade Forge Action Box */}
              <div className="md:w-64 bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <ArrowUpCircle className="w-4 h-4" /> Forge Upgrade
                  </h4>
                  <p className="text-[11px] text-neutral-400 mb-4">
                    Enhance base power and damage output by +15% per tier.
                  </p>

                  <div className="flex flex-col gap-2 mb-4 text-xs font-semibold">
                    <div className="flex justify-between text-neutral-300">
                      <span>Gold Cost:</span>
                      <span className="text-amber-400">{selectedItem.level * 180} 🪙</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Shadow Cores:</span>
                      <span className="text-indigo-400">{selectedItem.level * 15} 🔮</span>
                    </div>
                  </div>

                  {warningMsg && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-[11px] leading-tight">
                      {warningMsg}
                    </div>
                  )}
                </div>

                <button
                  id="forge-upgrade-btn"
                  onClick={() => handleUpgrade(selectedItem)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 font-cinzel font-bold text-black text-xs transition-all shadow-lg shadow-amber-950/50"
                >
                  Upgrade to Lv.{selectedItem.level + 1}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
