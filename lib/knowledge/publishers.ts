export interface PublisherKnowledge {
  code: string;
  publisher: string;
  series: string[];
  aliases: string[];
  ocrAliases: string[];
}

export const PUBLISHERS: PublisherKnowledge[] = [
  {
    code: "ORION",
    publisher: "Orion Publishers",
    series: ["Orion Series"],
    aliases: ["Orion"],
    ocrAliases: ["Orion", "Orien", "Orlon"],
  },

  {
    code: "EPS",
    publisher: "Excellence Publication & Stationery Ltd.",
    series: ["Excellence Series"],
    aliases: ["EPS", "Excellence"],
    ocrAliases: ["EPS", "E.P.S", "Excellence"],
  },

  {
    code: "GOLDEN",
    publisher: "Golden Publications",
    series: ["Golden Series"],
    aliases: ["Golden"],
    ocrAliases: ["Golden"],
  },

  {
    code: "DERBY",
    publisher: "Derby Publications",
    series: ["Derby Series"],
    aliases: ["Derby"],
    ocrAliases: ["Derby"],
  },

  {
    code: "EBS",
    publisher: "EBS Publications",
    series: ["EBS Series"],
    aliases: ["EBS"],
    ocrAliases: ["EBS"],
  },

  {
    code: "STRONGMAN",
    publisher: "Strongman Publications",
    series: ["Strongman Series"],
    aliases: ["Strongman"],
    ocrAliases: ["Strongman"],
  },

  {
    code: "BIO",
    publisher: "Bio Publications",
    series: ["Bio Series"],
    aliases: ["Bio"],
    ocrAliases: ["Bio"],
  },

  {
    code: "VICTORY",
    publisher: "Victory Publications",
    series: ["Victory Series"],
    aliases: ["Victory"],
    ocrAliases: ["Victory"],
  },
];

export function findPublisher(text: string) {
  const value = text.toLowerCase();

  return PUBLISHERS.find((publisher) =>
    [...publisher.aliases, ...publisher.ocrAliases].some((alias) =>
      value.includes(alias.toLowerCase())
    )
  );
}