import type { CardTemplateId } from "./card_types";

export type ReactionCategory =
  "normal" | "atp_investment" | "gapdh_redox" | "atp_payoff" | "branch";

export interface ReactionSpec {
  id: string;
  name: string;
  category: ReactionCategory;
  cardTemplateIds: readonly CardTemplateId[];
  notes: string;
  bonusPoints: number;
}

export const REACTION_SPECS = [
  {
    id: "hexokinase",
    name: "Hexokinase",
    category: "atp_investment",
    cardTemplateIds: ["glucose", "hexokinase", "atp", "glucose_6_phosphate", "adp"],
    notes: "ATP investment that opens glycolysis.",
    bonusPoints: 0,
  },
  {
    id: "phosphoglucose_isomerase",
    name: "Phosphoglucose isomerase",
    category: "normal",
    cardTemplateIds: ["glucose_6_phosphate", "phosphoglucose_isomerase", "fructose_6_phosphate"],
    notes: "Simple isomerization step.",
    bonusPoints: 0,
  },
  {
    id: "phosphofructokinase_1",
    name: "Phosphofructokinase-1",
    category: "atp_investment",
    cardTemplateIds: [
      "fructose_6_phosphate",
      "phosphofructokinase_1",
      "atp",
      "fructose_1_6_bisphosphate",
      "adp",
    ],
    notes: "Second ATP investment step.",
    bonusPoints: 0,
  },
  {
    id: "aldolase_basic",
    name: "Aldolase, basic GAP route",
    category: "normal",
    cardTemplateIds: ["fructose_1_6_bisphosphate", "aldolase", "glyceraldehyde_3_phosphate"],
    notes: "Basic aldolase-to-GAP route.",
    bonusPoints: 0,
  },
  {
    id: "aldolase_bonus",
    name: "Aldolase branch with DHAP and TPI",
    category: "branch",
    cardTemplateIds: [
      "fructose_1_6_bisphosphate",
      "aldolase",
      "dihydroxyacetone_phosphate",
      "triose_phosphate_isomerase",
      "glyceraldehyde_3_phosphate",
    ],
    notes: "Bonus DHAP + TPI + GAP route.",
    bonusPoints: 2,
  },
  {
    id: "triose_phosphate_isomerase",
    name: "Triose phosphate isomerase",
    category: "normal",
    cardTemplateIds: [
      "dihydroxyacetone_phosphate",
      "triose_phosphate_isomerase",
      "glyceraldehyde_3_phosphate",
    ],
    notes: "DHAP to GAP conversion.",
    bonusPoints: 0,
  },
  {
    id: "glyceraldehyde_3_phosphate_dehydrogenase",
    name: "Glyceraldehyde-3-phosphate dehydrogenase",
    category: "gapdh_redox",
    cardTemplateIds: [
      "glyceraldehyde_3_phosphate",
      "glyceraldehyde_3_phosphate_dehydrogenase",
      "nad_plus",
      "one_3_bisphosphoglycerate",
      "nadh",
    ],
    notes: "Redox step that swaps NAD+ for NADH.",
    bonusPoints: 0,
  },
  {
    id: "phosphoglycerate_kinase",
    name: "Phosphoglycerate kinase",
    category: "atp_payoff",
    cardTemplateIds: [
      "one_3_bisphosphoglycerate",
      "phosphoglycerate_kinase",
      "adp",
      "three_phosphoglycerate",
      "atp",
    ],
    notes: "First ATP payoff step.",
    bonusPoints: 0,
  },
  {
    id: "phosphoglycerate_mutase",
    name: "Phosphoglycerate mutase",
    category: "normal",
    cardTemplateIds: ["three_phosphoglycerate", "phosphoglycerate_mutase", "two_phosphoglycerate"],
    notes: "Moves the phosphate group.",
    bonusPoints: 0,
  },
  {
    id: "enolase",
    name: "Enolase",
    category: "normal",
    cardTemplateIds: ["two_phosphoglycerate", "enolase", "phosphoenolpyruvate"],
    notes: "Dehydration step that forms PEP.",
    bonusPoints: 0,
  },
  {
    id: "pyruvate_kinase",
    name: "Pyruvate kinase",
    category: "atp_payoff",
    cardTemplateIds: ["phosphoenolpyruvate", "pyruvate_kinase", "adp", "pyruvate", "atp"],
    notes: "Final ATP payoff step.",
    bonusPoints: 0,
  },
] as const satisfies readonly ReactionSpec[];
