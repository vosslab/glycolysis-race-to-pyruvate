export type CardKind = "molecule" | "enzyme" | "cofactor";

export type MoleculeId =
	| "glucose"
	| "glucose_6_phosphate"
	| "fructose_6_phosphate"
	| "fructose_1_6_bisphosphate"
	| "dihydroxyacetone_phosphate"
	| "glyceraldehyde_3_phosphate"
	| "one_3_bisphosphoglycerate"
	| "three_phosphoglycerate"
	| "two_phosphoglycerate"
	| "phosphoenolpyruvate"
	| "pyruvate";

export type EnzymeId =
	| "hexokinase"
	| "phosphoglucose_isomerase"
	| "phosphofructokinase_1"
	| "aldolase"
	| "triose_phosphate_isomerase"
	| "glyceraldehyde_3_phosphate_dehydrogenase"
	| "phosphoglycerate_kinase"
	| "phosphoglycerate_mutase"
	| "enolase"
	| "pyruvate_kinase";

export type CofactorId = "atp" | "adp" | "nad_plus" | "nadh";

export type CardTemplateId = MoleculeId | EnzymeId | CofactorId;

export interface BaseCardDefinition {
	id: CardTemplateId;
	name: string;
	shortName: string;
}

export interface MoleculeDefinition extends BaseCardDefinition {
	kind: "molecule";
	order: number;
	abbreviation: string;
}

export interface EnzymeDefinition extends BaseCardDefinition {
	kind: "enzyme";
	order: number;
}

export interface CofactorDefinition extends BaseCardDefinition {
	kind: "cofactor";
	charge: "neutral" | "positive" | "negative";
}

export type CardDefinition =
	| MoleculeDefinition
	| EnzymeDefinition
	| CofactorDefinition;

export interface CardInstance {
	cardId: string;
	templateId: CardTemplateId;
	name: string;
	shortName: string;
	kind: CardKind;
}

export interface MultisetCount {
	templateId: CardTemplateId;
	count: number;
}

