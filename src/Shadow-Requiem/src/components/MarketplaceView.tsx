import React, { useState, useMemo } from 'react';
import { 
  PlayerProfile, 
  PlayableCharacter, 
  GearRarity, 
  Faction 
} from '../game/types';
import { SWORD_MARKETPLACE_CATALOG, MarketplaceSword } from '../game/swordsCatalog';
import { PLAYABLE_CHARACTERS, getCharacterById } from '../game/characters';
//import { soundEngine } from '../game/audio';
import { 
  Search, 
  Sparkles, 
  Check, 
  Crown, 
  Coins, 
  Gem, 
  X, 
  Filter, 
  ArrowUpDown, 
  Flame, 
  Shield, 
  Zap, 
  Swords, 
  Gift, 
  ChevronRight,
  Eye
} from 'lucide-react';

interface MarketplaceViewProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onClose: () => void;
}

const RARITY_COLORS: Record<GearRarity, { border: string; bg: string; text: string; glow: string; badge: string }> = {
  common: {
    border: 'border-neutral-700',
    bg: 'from-neutral-900/90 to-neutral-950/90',
    text: 'text-neutral-300',
    glow: '#737373',
    badge: 'bg-neutral-800 text-neutral-300 border-neutral-600',
  },
  rare: {
    border: 'border-sky-500/50',
    bg: 'from-sky-950/50 to-neutral-950/90',
    text: 'text-sky-300',
    glow: '#38bdf8',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  epic: {
    border: 'border-purple-500/60',
    bg: 'from-purple-950/50 to-neutral-950/90',
    text: 'text-purple-300',
    glow: '#c084fc',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  legendary: {
    border: 'border-amber-500/70',
    bg: 'from-amber-950/50 to-neutral-950/90',
    text: 'text-amber-300',
    glow: '#fbbf24',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  },
  mythic: {
    border: 'border-rose-500/80',
    bg: 'from-rose-950/60 to-purple-950/70',
    text: 'text-rose-300',
    glow: '#f43f5e',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/60',
  },
};

const FACTION_ICONS: Record<Faction, { label: string; color: string; icon: React.ReactNode }> = {
  legion: { label: 'Iron Legion', color: 'text-amber-400', icon: <Shield className="w-3 h-3" /> },
  dynasty: { label: 'Dynasty', color: 'text-emerald-400', icon: <Flame className="w-3 h-3" /> },
  heralds: { label: 'Heralds', color: 'text-indigo-400', icon: <Zap className="w-3 h-3" /> },
};

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<GearRarity | 'all'>('all');
  const [selectedFaction, setSelectedFaction] = useState<Faction | 'all'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [sortBy, setSortBy] = useState<'rarity_desc' | 'price_asc' | 'price_desc' | 'power_desc'>('rarity_desc');
  
  // Inspection / Equip Modal state
  const [inspectingSword, setInspectingSword] = useState<MarketplaceSword | null>(null);
  const [targetCharacterId, setTargetCharacterId] = useState<string>(profile.activeCharacterId || 'char_raven');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Check if a sword is owned in profile inventory or currently equipped
  const isSwordOwned = (swordId: string, swordIndex?: number) => {
    if (profile.equipped.weapon.id === swordId) return true;
    if (profile.equipped.weapon.swordIndex === swordIndex && swordIndex !== undefined) return true;
    return profile.inventory.some(
      (item) => item.id === swordId || (item.swordIndex === swordIndex && swordIndex !== undefined)
    );
  };

  // Check if equipped on active character
  const isEquippedOnActive = (swordId: string, swordIndex?: number) => {
    return profile.equipped.weapon.id === swordId || 
      (profile.equipped.weapon.swordIndex === swordIndex && swordIndex !== undefined);
  };

  // Handle purchasing sword
  const handleBuySword = (sword: MarketplaceSword, equipDirectlyToCharId?: string) => {
    // Check funds
    if (profile.gold < sword.priceGold || profile.gems < sword.priceGems) {
      //soundEngine.playSwing('heavy');
      showToast(`Insufficient funds! Need 🪙 ${sword.priceGold}${sword.priceGems > 0 ? ` and 💎 ${sword.priceGems}` : ''}`);
      return;
    }

    const updatedGold = profile.gold - sword.priceGold;
    const updatedGems = profile.gems - sword.priceGems;

    // Add to inventory
    const updatedInventory = [...profile.inventory, sword];

    let updatedEquipped = { ...profile.equipped };
    const charIdToEquip = equipDirectlyToCharId || profile.activeCharacterId;

    // If equipping to current active character
    if (charIdToEquip === profile.activeCharacterId) {
      updatedEquipped = {
        ...updatedEquipped,
        weapon: sword,
      };
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      gold: updatedGold,
      gems: updatedGems,
      inventory: updatedInventory,
      equipped: updatedEquipped,
    };

    onUpdateProfile(updatedProfile);
    //soundEngine.playEquip();
    showToast(`Purchased ${sword.name}!${charIdToEquip ? ` Equipped to ${getCharacterById(charIdToEquip).name}.` : ''}`);
  };

  // Handle equipping an already owned sword to selected character
  const handleEquipSword = (sword: MarketplaceSword, charId: string) => {
    if (charId === profile.activeCharacterId) {
      const updatedProfile: PlayerProfile = {
        ...profile,
        equipped: {
          ...profile.equipped,
          weapon: sword,
        },
      };
      onUpdateProfile(updatedProfile);
    } else {
      // Find character in roster and note weapon preference
      // In this system, profile.equipped is for the active duelist; if selecting another character, we also switch or record
      const char = getCharacterById(charId);
      char.signatureWeapon = sword;
      showToast(`Equipped ${sword.name} to ${char.name}!`);
    }

    //soundEngine.playEquip();
    showToast(`Equipped ${sword.name} to ${getCharacterById(charId).name}!`);
  };

  // Daily combat spoils / currency bounty claim
  const handleClaimSpoils = () => {
    const updatedProfile: PlayerProfile = {
      ...profile,
      gold: profile.gold + 1500,
      gems: profile.gems + 60,
      shadowCores: profile.shadowCores + 15,
    };
    onUpdateProfile(updatedProfile);
    //soundEngine.playEquip();
    showToast('Claimed Imperial Bounty: +1,500 Gold & +60 Gems!');
  };

  // Filtered & Sorted Swords
  const filteredSwords = useMemo(() => {
    const rarityRank: Record<GearRarity, number> = {
      mythic: 5,
      legendary: 4,
      epic: 3,
      rare: 2,
      common: 1,
    };

    return SWORD_MARKETPLACE_CATALOG.filter((sword) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sword.name.toLowerCase().includes(q);
        const matchesFaction = sword.faction.toLowerCase().includes(q);
        const matchesPerks = sword.perks.some((p) => p.toLowerCase().includes(q));
        if (!matchesName && !matchesFaction && !matchesPerks) return false;
      }

      // Rarity
      if (selectedRarity !== 'all' && sword.rarity !== selectedRarity) {
        return false;
      }

      // Faction
      if (selectedFaction !== 'all' && sword.faction !== selectedFaction) {
        return false;
      }

      // Ownership
      if (ownershipFilter === 'owned' && !isSwordOwned(sword.id, sword.swordIndex)) {
        return false;
      }
      if (ownershipFilter === 'unowned' && isSwordOwned(sword.id, sword.swordIndex)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rarity_desc') {
        return rarityRank[b.rarity] - rarityRank[a.rarity] || b.basePower - a.basePower;
      }
      if (sortBy === 'price_asc') {
        return a.priceGold - b.priceGold;
      }
      if (sortBy === 'price_desc') {
        return b.priceGold - a.priceGold;
      }
      if (sortBy === 'power_desc') {
        return b.basePower - a.basePower;
      }
      return 0;
    });
  }, [searchQuery, selectedRarity, selectedFaction, ownershipFilter, sortBy, profile]);

  const activeChar = getCharacterById(profile.activeCharacterId || 'char_raven');
  const unlockedCharacters = PLAYABLE_CHARACTERS.filter((c) =>
    profile.unlockedCharacterIds.includes(c.id) || c.id === profile.activeCharacterId
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-neutral-900/95 border border-amber-500/60 shadow-2xl text-amber-300 font-cinzel font-bold text-xs flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Treasury Status */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#1c112b] via-[#121324] to-[#0d1527] border border-amber-500/30 p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow lights */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-3">
            <Swords className="w-3.5 h-3.5 text-amber-400" /> Grand Armory Marketplace
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-black text-white leading-tight mb-2">
            70 Master Blades • Precision Transparent Cutouts
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Every sword has been extracted cleanly with transparent backgrounds so only the blade, guard, and steel are visible when swung in combat. Purchase legendary weapons and equip them directly to your duelist roster.
          </p>
        </div>

        {/* Currency Vault & Bounty Claim */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-4 bg-black/70 px-5 py-3 rounded-2xl border border-neutral-700/80 shadow-inner">
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Gold</div>
                <div className="font-cinzel font-black text-amber-400 text-sm">{profile.gold.toLocaleString()}</div>
              </div>
            </div>
            <div className="h-7 w-[1px] bg-neutral-800" />
            <div className="flex items-center gap-2">
              <span className="text-lg">💎</span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Gems</div>
                <div className="font-cinzel font-black text-sky-400 text-sm">{profile.gems.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <button
            id="claim-daily-spoils-btn"
            onClick={handleClaimSpoils}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 border border-amber-400/40 transition-all hover:scale-105"
          >
            <Gift className="w-4 h-4 text-amber-200" />
            <span>Claim Combat Spoils (+1.5k 🪙)</span>
          </button>
        </div>
      </div>

      {/* Filter, Search, and Sorting Bar */}
      <div className="bg-[#11131e] border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="marketplace-search-input"
            type="text"
            placeholder="Search 70 swords by name, faction, or perk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-neutral-800 text-neutral-200 placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500/60 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Rarity selector */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
            {(['all', 'common', 'rare', 'epic', 'legendary', 'mythic'] as const).map((r) => (
              <button
                key={r}
                id={`filter-rarity-${r}`}
                onClick={() => setSelectedRarity(r)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                  selectedRarity === r
                    ? 'bg-neutral-800 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Faction selector */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
            {(['all', 'legion', 'dynasty', 'heralds'] as const).map((f) => (
              <button
                key={f}
                id={`filter-faction-${f}`}
                onClick={() => setSelectedFaction(f)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                  selectedFaction === f
                    ? 'bg-neutral-800 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Ownership toggle */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-neutral-800">
            {(['all', 'unowned', 'owned'] as const).map((o) => (
              <button
                key={o}
                id={`filter-ownership-${o}`}
                onClick={() => setOwnershipFilter(o)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                  ownershipFilter === o
                    ? 'bg-neutral-800 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              id="marketplace-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/60 border border-neutral-800 text-neutral-300 text-xs font-bold focus:outline-none focus:border-amber-500/60 cursor-pointer"
            >
              <option value="rarity_desc">Sort: Highest Rarity</option>
              <option value="power_desc">Sort: Highest Power</option>
              <option value="price_asc">Sort: Price (Low → High)</option>
              <option value="price_desc">Sort: Price (High → Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Counter & Active Champion Indicator */}
      <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-white">{filteredSwords.length}</strong> of 70 Swords</span>
          <span className="text-neutral-600">•</span>
          <span>Equipping for Active Duelist: <strong className="text-amber-400 font-cinzel">{activeChar.name}</strong></span>
        </div>
        <div>
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            Back to Hub <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Swords Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSwords.map((sword) => {
          const isOwned = isSwordOwned(sword.id, sword.swordIndex);
          const isEquipped = isEquippedOnActive(sword.id, sword.swordIndex);
          const rarityStyle = RARITY_COLORS[sword.rarity];
          const factionData = FACTION_ICONS[sword.faction];
          const canAfford = profile.gold >= sword.priceGold && profile.gems >= sword.priceGems;

          return (
            <div
              key={sword.id}
              id={`marketplace-card-${sword.id}`}
              className={`group relative rounded-2xl bg-gradient-to-b ${rarityStyle.bg} border ${
                isEquipped ? 'border-amber-400 shadow-amber-500/20 shadow-xl' : rarityStyle.border
              } p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-400/80`}
            >
              {/* Top Tags: Rarity & Faction */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${rarityStyle.badge}`}>
                  {sword.rarity}
                </span>
                <span className={`text-[10px] font-bold flex items-center gap-1 ${factionData.color}`}>
                  {factionData.icon} {factionData.label}
                </span>
              </div>

              {/* Weapon Display Area - Pixel Art Image with Transparent Background and Dynamic Aura */}
              <div 
                onClick={() => setInspectingSword(sword)}
                className="relative w-full h-36 rounded-xl bg-black/40 border border-neutral-800/80 flex items-center justify-center p-3 cursor-pointer group-hover:bg-black/60 transition-colors overflow-hidden"
              >
                {/* Dynamic weapon background aura */}
                <div 
                  className="absolute w-24 h-24 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"
                  style={{ backgroundColor: rarityStyle.glow }}
                />

                {/* The 100% transparent cut-out sword image */}
                <img
                  src={sword.spriteUrl}
                  alt={sword.name}
                  style={{ imageRendering: 'pixelated' }}
                  className="relative z-10 w-24 h-24 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                />

                {/* Inspect eye icon on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 p-1.5 rounded-lg text-neutral-300 hover:text-white">
                  <Eye className="w-3.5 h-3.5" />
                </div>

                {isEquipped && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-neutral-950 font-cinzel font-black text-[9px] uppercase tracking-wider shadow">
                    Active Blade
                  </div>
                )}
              </div>

              {/* Weapon Name & Base Stats */}
              <div className="mt-3">
                <h4 className="font-cinzel font-bold text-white text-sm leading-tight truncate group-hover:text-amber-300 transition-colors">
                  {sword.name}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-300">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Power</span>
                    <strong className="text-amber-400 font-bold">{sword.basePower}</strong>
                  </div>
                  <div className="h-5 w-[1px] bg-neutral-800" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Attack</span>
                    <strong className="text-emerald-400 font-bold">+{sword.attackBonus}</strong>
                  </div>
                  <div className="h-5 w-[1px] bg-neutral-800" />
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Crit</span>
                    <strong className="text-sky-400 font-bold">{Math.round((sword.critChance || 0) * 100)}%</strong>
                  </div>
                </div>

                {/* Perks */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {sword.perks.map((p, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/60 font-medium">
                      ✦ {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Section: Price / Equip Button */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                {isOwned ? (
                  isEquipped ? (
                    <div className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-cinzel font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5" /> Equipped
                    </div>
                  ) : (
                    <button
                      id={`equip-sword-${sword.id}`}
                      onClick={() => handleEquipSword(sword, profile.activeCharacterId)}
                      className="w-full py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/50 text-purple-200 font-cinzel font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                    >
                      <Swords className="w-3.5 h-3.5" /> Equip Blade
                    </button>
                  )
                ) : (
                  <button
                    id={`buy-sword-${sword.id}`}
                    onClick={() => handleBuySword(sword)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl font-cinzel font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40 hover:scale-[1.02]'
                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                    }`}
                  >
                    <span>Buy</span>
                    <span className="flex items-center gap-1 text-amber-200 font-mono">
                      🪙 {sword.priceGold}
                    </span>
                    {sword.priceGems > 0 && (
                      <span className="flex items-center gap-0.5 text-sky-300 font-mono">
                        💎 {sword.priceGems}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sword Inspection & Character Equipper Modal */}
      {inspectingSword && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectingSword(null)}
        >
          <div 
            className="relative w-full max-w-2xl rounded-3xl bg-[#121320] border border-amber-500/40 p-6 md:p-8 shadow-2xl overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setInspectingSword(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Large floating sword preview */}
              <div className="relative w-56 h-56 rounded-2xl bg-black/60 border border-neutral-800 flex items-center justify-center p-4 overflow-hidden shrink-0 shadow-inner">
                <div 
                  className="absolute w-40 h-40 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
                  style={{ backgroundColor: inspectingSword.colorScheme?.glow || '#fbbf24' }}
                />
                {/* Floating animation */}
                <img
                  src={inspectingSword.spriteUrl}
                  alt={inspectingSword.name}
                  style={{ imageRendering: 'pixelated' }}
                  className="relative z-10 w-40 h-40 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] animate-floating"
                />
              </div>

              {/* Weapon Stats & Lore */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md border ${RARITY_COLORS[inspectingSword.rarity].badge}`}>
                    {inspectingSword.rarity}
                  </span>
                  <span className="text-xs text-neutral-400 capitalize">
                    {inspectingSword.faction} {inspectingSword.weaponType}
                  </span>
                </div>
                <h3 className="font-cinzel text-2xl font-black text-white mb-2">
                  {inspectingSword.name}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  {inspectingSword.description}
                </p>

                {/* Key stats row */}
                <div className="grid grid-cols-3 gap-2 bg-black/50 p-3 rounded-xl border border-neutral-800 text-xs mb-4">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 block">Total Power</span>
                    <strong className="text-amber-400 font-black text-sm">{inspectingSword.basePower}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 block">Physical Damage</span>
                    <strong className="text-emerald-400 font-black text-sm">+{inspectingSword.attackBonus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-neutral-500 block">Shadow Affinity</span>
                    <strong className="text-purple-400 font-black text-sm">+{inspectingSword.shadowBonus}</strong>
                  </div>
                </div>

                {/* Equipped Character Selector */}
                <div className="mb-4">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Equip to Playable Character:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {unlockedCharacters.map((char) => {
                      const isTarget = targetCharacterId === char.id;
                      return (
                        <button
                          key={char.id}
                          id={`target-char-${char.id}`}
                          onClick={() => setTargetCharacterId(char.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isTarget
                              ? 'bg-purple-900/40 border-purple-500 text-white shadow-md'
                              : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-xs font-cinzel font-bold truncate">{char.name}</div>
                          <div className="text-[10px] text-neutral-500 capitalize">{char.faction}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center gap-3">
                  {isSwordOwned(inspectingSword.id, inspectingSword.swordIndex) ? (
                    <button
                      id="modal-equip-btn"
                      onClick={() => {
                        handleEquipSword(inspectingSword, targetCharacterId);
                        setInspectingSword(null);
                      }}
                      className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-cinzel font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all"
                    >
                      <Swords className="w-4 h-4" /> Equip to {getCharacterById(targetCharacterId).name}
                    </button>
                  ) : (
                    <button
                      id="modal-buy-and-equip-btn"
                      onClick={() => {
                        handleBuySword(inspectingSword, targetCharacterId);
                        setInspectingSword(null);
                      }}
                      disabled={profile.gold < inspectingSword.priceGold || profile.gems < inspectingSword.priceGems}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 font-cinzel font-bold text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all border border-amber-400/40"
                    >
                      <Coins className="w-4 h-4" /> Buy for 🪙 {inspectingSword.priceGold} {inspectingSword.priceGems > 0 ? `& 💎 ${inspectingSword.priceGems}` : ''} & Equip
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
