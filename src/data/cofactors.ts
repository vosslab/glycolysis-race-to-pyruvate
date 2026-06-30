import type { CofactorDefinition } from "./card_types";

export const COFACTORS = [
  {
    id: "atp",
    name: "ATP",
    shortName: "ATP",
    kind: "cofactor",
    charge: "negative",
  },
  {
    id: "adp",
    name: "ADP",
    shortName: "ADP",
    kind: "cofactor",
    charge: "negative",
  },
  {
    id: "nad_plus",
    name: "NAD+",
    shortName: "NAD+",
    kind: "cofactor",
    charge: "positive",
  },
  {
    id: "nadh",
    name: "NADH",
    shortName: "NADH",
    kind: "cofactor",
    charge: "neutral",
  },
] as const satisfies readonly CofactorDefinition[];
