// sdk.ts - TypeScript Client SDK für TTT System API
export type Cfg = { base: string; apiKey?: string; bearer?: string; };

const headers = (cfg: Cfg) => {
  const h: Record<string,string> = { 'Content-Type':'application/json' };
  if (cfg.apiKey) h['X-API-Key'] = cfg.apiKey;
  if (cfg.bearer) h['Authorization'] = `Bearer ${cfg.bearer}`;
  return h;
};

async function req<T>(cfg: Cfg, path: string, init: RequestInit): Promise<T> {
  const url = `${cfg.base}${path}`;
  let lastErr: any;
  for (let i=0;i<3;i++){
    try {
      const r = await fetch(url, { ...init, headers: { ...headers(cfg), ...(init.headers||{}) } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json() as T;
    } catch(e){ lastErr=e; await new Promise(res=>setTimeout(res, 250*(i+1))); }
  }
  throw lastErr;
}

// Manifest
export const Manifest = {
  list: (cfg: Cfg, q?: { page?: number; pageSize?: number; language?: string; tag?: string; since?: string }) =>
    req(cfg, `/manifest/entries${q ? `?${new URLSearchParams(q as any)}`:''}`, { method:'GET' }),
  publish: (cfg: Cfg, body: any) =>
    req(cfg, `/manifest/entries`, { method:'POST', body: JSON.stringify(body) }),
  get: (cfg: Cfg, id: string) =>
    req(cfg, `/manifest/entries/${id}`, { method:'GET' }),
  update: (cfg: Cfg, id: string, body: any) =>
    req(cfg, `/manifest/entries/${id}`, { method:'PATCH', body: JSON.stringify(body) }),
};

// Voucher
export const Voucher = {
  types: (cfg: Cfg) => req(cfg, `/voucher/service-types`, { method:'GET' }),
  create: (cfg: Cfg, body: any) => req(cfg, `/voucher/vouchers`, { method:'POST', body: JSON.stringify(body) }),
  slots: (cfg: Cfg, q: any) => req(cfg, `/voucher/slots?${new URLSearchParams(q)}`, { method:'GET' }),
  book: (cfg: Cfg, body: any) => req(cfg, `/voucher/bookings`, { method:'POST', body: JSON.stringify(body) }),
};

// Telbank
export const Telbank = {
  wallets: (cfg: Cfg) => req(cfg, `/telbank/wallets`, { method:'GET' }),
  walletCreate: (cfg: Cfg, body: any) => req(cfg, `/telbank/wallets`, { method:'POST', body: JSON.stringify(body) }),
  transact: (cfg: Cfg, body: any) => req(cfg, `/telbank/transactions`, { method:'POST', body: JSON.stringify(body) }),
};

// Legal
export const Legal = {
  create: (cfg: Cfg, body: any) => req(cfg, `/legal/contracts`, { method:'POST', body: JSON.stringify(body) }),
  sign: (cfg: Cfg, id: string, body: any) => req(cfg, `/legal/contracts/${id}/sign`, { method:'POST', body: JSON.stringify(body) }),
};

// Rooms
export const Rooms = {
  create: (cfg: Cfg, body: any) => req(cfg, `/room/create`, { method:'POST', body: JSON.stringify(body) }),
  signal: (cfg: Cfg, id: string, body: any) => req(cfg, `/room/${id}/signal`, { method:'POST', body: JSON.stringify(body) }),
  syncManifest: (cfg: Cfg, id: string, body: any) => req(cfg, `/room/${id}/p2p-sync`, { method:'POST', body: JSON.stringify(body) }),
};

// Business
export const Biz = {
  realEstate: (cfg: Cfg, body: any) => req(cfg, `/business/immobilien/anfragen`, { method:'POST', body: JSON.stringify(body) }),
  credit: (cfg: Cfg, body: any) => req(cfg, `/business/kredite/anfragen`, { method:'POST', body: JSON.stringify(body) }),
  eventBook: (cfg: Cfg, body: any) => req(cfg, `/business/events/bookings`, { method:'POST', body: JSON.stringify(body) }),
  machineSlot: (cfg: Cfg, body: any) => req(cfg, `/business/machines/timeslots`, { method:'POST', body: JSON.stringify(body) }),
  membershipJoin: (cfg: Cfg, body: any) => req(cfg, `/business/memberships/join`, { method:'POST', body: JSON.stringify(body) }),
};

