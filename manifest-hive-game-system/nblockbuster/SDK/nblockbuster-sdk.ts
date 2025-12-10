// nBlockbuster SDK - TypeScript
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

/**
 * nBlockbuster SDK für TypeScript/JavaScript
 * 
 * Verwendung:
 * ```typescript
 * import { openYear, startHive, submitMemory } from './nblockbuster-sdk';
 * 
 * const yearData = await openYear(1913);
 * const hive = await startHive('fantomas_1913', 'watch', 'PUBLIC_NUMBER');
 * await submitMemory({ alias: 'User', year: 1913, text: 'Erinnerung...' });
 * ```
 */

export interface YearData {
  year: number;
  decade: string;
  spanTags: string[];
  items50Plus: ContentItem[];
  items50Minus: ContentItem[];
  highlights: string[];
  collections: Collection[];
  memories: Memory[];
  editorialNotes?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  year: number;
  spanTag: '50+' | '50-';
  type: string;
  culture?: string;
  language?: string;
  license?: string;
  synopsis?: string;
  tags?: string[];
  embed?: {
    player: string;
    code: string;
  };
}

export interface Collection {
  id: string;
  title: string;
  years: number[];
  theme?: string;
  description?: string;
  visibility: 'public' | 'curated' | 'private';
}

export interface Memory {
  id: string;
  alias: string;
  year?: number;
  contentId?: string;
  text: string;
  mediaUrl?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface HiveLaunchResult {
  ok: boolean;
  hive_room_id: string;
  public_number?: number;
  joinUrl: string;
  content: ContentItem;
  suggestedGames: any[];
  ritualOverlay: {
    intro: string;
    seriousness: string;
  };
}

const API_BASE = typeof window !== 'undefined' 
  ? `${window.location.origin}/api`
  : process.env.API_BASE || 'http://localhost:3000/api';

/**
 * Öffne Jahrspanel
 */
export async function openYear(year: number): Promise<YearData> {
  const response = await fetch(`${API_BASE}/nb/year/${year}`);
  if (!response.ok) {
    throw new Error(`Failed to load year ${year}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Öffne Content Item
 */
export async function openItem(itemId: string): Promise<{
  content: ContentItem;
  sources: any[];
  relatedGames: any[];
  collections: Collection[];
}> {
  const response = await fetch(`${API_BASE}/nb/item/${itemId}`);
  if (!response.ok) {
    throw new Error(`Failed to load item ${itemId}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Starte HiveRoom mit Content
 */
export async function startHive(
  itemId: string,
  mode: 'watch' | 'listen' | 'read' | 'play',
  hiveType: 'PUBLIC_NUMBER' | 'GROUP_LINK' | 'PRIVATE',
  options?: {
    seriousness?: 'serious' | 'neutral' | 'light';
    publicNumber?: number;
  }
): Promise<HiveLaunchResult> {
  const response = await fetch(`${API_BASE}/nb/hive/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemId,
      mode,
      hiveType,
      seriousness: options?.seriousness || 'serious',
      publicNumber: options?.publicNumber
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to launch hive: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Reiche Erinnerung ein
 */
export async function submitMemory(payload: {
  alias: string;
  year?: number;
  contentId?: string;
  text: string;
  mediaUrl?: string;
}): Promise<{ ok: boolean; memory_id: string; status: string }> {
  const response = await fetch(`${API_BASE}/nb/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to submit memory: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Hole Erinnerungen für ein Jahr
 */
export async function getMemories(year: number): Promise<Memory[]> {
  const response = await fetch(`${API_BASE}/nb/memory/${year}`);
  if (!response.ok) {
    throw new Error(`Failed to load memories: ${response.statusText}`);
  }
  const data = await response.json();
  return data.memories || [];
}

/**
 * Hole Content-Katalog (filterbar)
 */
export async function getCatalog(filters?: {
  year?: number;
  spanTag?: '50+' | '50-';
  type?: string;
  culture?: string;
  query?: string;
}): Promise<{ items: ContentItem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.year) params.append('year', filters.year.toString());
  if (filters?.spanTag) params.append('spanTag', filters.spanTag);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.culture) params.append('culture', filters.culture);
  if (filters?.query) params.append('query', filters.query);
  
  const response = await fetch(`${API_BASE}/nb/catalog?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load catalog: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Hole vorgeschlagene Spiele für Content
 */
export async function suggestGames(itemId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/nb/hive/suggest_games/${itemId}`);
  if (!response.ok) {
    throw new Error(`Failed to load game suggestions: ${response.statusText}`);
  }
  const data = await response.json();
  return data.suggestions || [];
}

/**
 * Erstelle/Update Collection
 */
export async function createCollection(payload: {
  id?: string;
  title: string;
  years: number[];
  theme?: string;
  description?: string;
  visibility?: 'public' | 'curated' | 'private';
  curatorAlias?: string;
  items?: string[];
}): Promise<{ ok: boolean; collection_id: string }> {
  const response = await fetch(`${API_BASE}/nb/collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create collection: ${response.statusText}`);
  }
  
  return response.json();
}

// Export für globale Verwendung (Browser)
if (typeof window !== 'undefined') {
  (window as any).nBlockbuster = {
    openYear,
    openItem,
    startHive,
    submitMemory,
    getMemories,
    getCatalog,
    suggestGames,
    createCollection
  };
}


