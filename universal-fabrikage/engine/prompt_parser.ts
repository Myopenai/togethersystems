// Prompt Parser - NLP/Heuristics für Intent-Erkennung
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

export type Intent = {
  text: string;
  domains: string[];      // e.g., ["Finanz","Energie","Statistik"]
  targets: string[];      // e.g., ["web","mobile","cli"]
  privacy: "lan" | "vpn" | "tor";
  performance: "normal" | "high";
  outputs: string[];      // desired outputs (reports, predictions)
  constraints?: {
    latency?: number;
    storage?: string;
    encryption?: boolean;
  };
};

const domainMap = [
  { key: /bank|konto|buchung|finanz|geld|zins/i, domain: "Finanz", schema: "BA_bank.schema.json" },
  { key: /energie|strom|verbrauch|solar|brennstoffzelle|kwh/i, domain: "Energie", schema: "EE_energy.schema.json" },
  { key: /prognose|zeitreihe|forecast|statistik|analyse|mittelwert/i, domain: "Statistik", schema: "ZZ_time_series.schema.json" },
  { key: /verifikation|notar|manifest|signatur|beglaubigung/i, domain: "Notar", schema: "NN_notary.schema.json" },
  { key: /versicherung|vertrag|police/i, domain: "Versicherung", schema: "AV_ins.schema.json" },
  { key: /haushalt|budget|bilanz|einnahmen|ausgaben/i, domain: "Haushalt", schema: "BB_budget.schema.json" },
  { key: /investition|portfolio|aktie|rendite/i, domain: "Investition", schema: "EI_income_invest.schema.json" },
  { key: /produkt|startup|perfektion|manifest/i, domain: "Produkt", schema: "PP_product.schema.json" },
  { key: /identität|account|user|login/i, domain: "Identity", schema: "AA_identity.schema.json" }
];

export function parsePrompt(text: string): Intent {
  const domains = domainMap
    .filter(m => m.key.test(text))
    .map(m => m.domain);
  
  // Default: Finanz wenn nichts erkannt
  if (domains.length === 0) {
    domains.push("Finanz");
  }

  // Target-Erkennung
  let targets: string[] = ["web"];
  if (/mobile|android|ios|iphone|ipad/i.test(text)) {
    targets = ["mobile", "web"];
  } else if (/desktop|mac|windows|linux|app/i.test(text)) {
    targets = ["desktop", "web"];
  } else if (/cli|command|terminal|script/i.test(text)) {
    targets = ["cli", "web"];
  }

  // Privacy-Level
  let privacy: "lan" | "vpn" | "tor" = "lan";
  if (/tor|i2p|anonym|privacy/i.test(text)) {
    privacy = "tor";
  } else if (/vpn|secure|verschlüsselt/i.test(text)) {
    privacy = "vpn";
  }

  // Performance
  const performance: "normal" | "high" = 
    /high|rust|go|realtime|performance|schnell/i.test(text) ? "high" : "normal";

  // Outputs
  const outputs: string[] = [];
  if (/report|bericht|export/i.test(text)) outputs.push("report");
  if (/dashboard|visualisierung|chart|diagramm/i.test(text)) outputs.push("dashboard");
  if (/api|rest|graphql/i.test(text)) outputs.push("api");
  if (outputs.length === 0) outputs.push("report");

  // Constraints
  const constraints: any = {};
  const latencyMatch = text.match(/(\d+)\s*(ms|millisekunden)/i);
  if (latencyMatch) {
    constraints.latency = parseInt(latencyMatch[1]);
  }
  if (/verschlüsselt|encrypt|aes/i.test(text)) {
    constraints.encryption = true;
  }

  return {
    text,
    domains,
    targets,
    privacy,
    performance,
    outputs,
    constraints
  };
}

// CLI
if (require.main === module) {
  const text = process.argv.slice(2).join(' ') || "Erstelle ein Haushaltsbuch mit Solar-Energie-Berechnung";
  const intent = parsePrompt(text);
  console.log(JSON.stringify(intent, null, 2));
}

module.exports = { parsePrompt, Intent };


