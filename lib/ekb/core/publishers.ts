import { Publisher } from "../types";

/**
 * Educational Knowledge Base (EKB)
 * Official Publisher Registry
 *
 * Source:
 * NaCCA Approved Instructional Resources
 *
 * This file contains legal publishing organisations.
 * It intentionally does NOT contain product names,
 * series names or book lines.
 */

export const PUBLISHERS: Publisher[] = [
  {
    id: "publisher-masterman",
    code: "PUB_MASTERMAN",
    name: "Masterman Publications Ltd.",
    aliases: [
      "masterman",
      "masterman publications",
      "masterman publications ltd",
    ],
    active: true,
  },

  {
    id: "publisher-new-golden",
    code: "PUB_NEW_GOLDEN",
    name: "New Golden Publications",
    aliases: [
      "new golden",
      "golden publications",
      "new golden publications",
    ],
    active: true,
  },

  {
    id: "publisher-best-brain",
    code: "PUB_BEST_BRAIN",
    name: "Best Brain Publications",
    aliases: [
      "best brain",
      "best brain publication",
      "best brain publications",
    ],
    active: true,
  },

  {
    id: "publisher-york",
    code: "PUB_YORK",
    name: "York Press",
    aliases: [
      "york",
      "york press",
    ],
    active: true,
  },

  {
    id: "publisher-excellence",
    code: "PUB_EXCELLENCE",
    name: "Excellence Publication & Stationery Ltd.",
    aliases: [
      "excellence",
      "excellence publication",
      "excellence publications",
      "excellence publication and stationery",
    ],
    active: true,
  },

  {
    id: "publisher-winmat",
    code: "PUB_WINMAT",
    name: "Winmat Publishers Ltd.",
    aliases: [
      "winmat",
      "winmat publishers",
    ],
    active: true,
  },

  {
    id: "publisher-ark",
    code: "PUB_ARK",
    name: "Ark Publications",
    aliases: [
      "ark",
      "ark publications",
    ],
    active: true,
  },

  {
    id: "publisher-epp",
    code: "PUB_EPP",
    name: "EPP Books Services Ltd.",
    aliases: [
      "epp",
      "epp books",
      "epp books services",
    ],
    active: true,
  },

  {
    id: "publisher-pegasus",
    code: "PUB_PEGASUS",
    name: "Pegasus Publishing Ltd.",
    aliases: [
      "pegasus",
      "pegasus publishing",
    ],
    active: true,
  },

  {
    id: "publisher-kudusoft",
    code: "PUB_KUDUSOFT",
    name: "Kudusoft Publications",
    aliases: [
      "kudusoft",
      "kudusoft publications",
    ],
    active: true,
  },

  {
    id: "publisher-sub-saharan",
    code: "PUB_SUB_SAHARAN",
    name: "Sub-Saharan Publishers",
    aliases: [
      "sub saharan",
      "sub-saharan",
      "sub saharan publishers",
      "sub-saharan publishers",
    ],
    active: true,
  },

  {
    id: "publisher-kwadwoan",
    code: "PUB_KWADWOAN",
    name: "Kwadwoan Publishing",
    aliases: [
      "kwadwoan",
      "kwadwoan publishing",
    ],
    active: true,
  },

  {
    id: "publisher-red-oak",
    code: "PUB_RED_OAK",
    name: "Red Oak Limited",
    aliases: [
      "red oak",
      "red oak limited",
    ],
    active: true,
  },

  {
    id: "publisher-pi-system",
    code: "PUB_PI_SYSTEM",
    name: "PI SYSTEM",
    aliases: [
      "pi system",
      "pisystem",
    ],
    active: true,
  },

  {
    id: "publisher-practical-education-network",
    code: "PUB_PEN",
    name: "Practical Education Network",
    aliases: [
      "practical education network",
      "pen",
    ],
    active: true,
  },
];

export const PUBLISHER_BY_CODE = new Map(
  PUBLISHERS.map((publisher) => [publisher.code, publisher]),
);

export const PUBLISHER_BY_NAME = new Map(
  PUBLISHERS.map((publisher) => [
    publisher.name.toLowerCase(),
    publisher,
  ]),
);
