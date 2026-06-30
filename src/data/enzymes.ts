import type { EnzymeDefinition } from "./card_types";

export const ENZYMES = [
	{
		id: "hexokinase",
		name: "Hexokinase",
		shortName: "HK",
		kind: "enzyme",
		order: 1,
	},
	{
		id: "phosphoglucose_isomerase",
		name: "Phosphoglucose isomerase",
		shortName: "PGI",
		kind: "enzyme",
		order: 2,
	},
	{
		id: "phosphofructokinase_1",
		name: "Phosphofructokinase-1",
		shortName: "PFK-1",
		kind: "enzyme",
		order: 3,
	},
	{
		id: "aldolase",
		name: "Aldolase",
		shortName: "ALD",
		kind: "enzyme",
		order: 4,
	},
	{
		id: "triose_phosphate_isomerase",
		name: "Triose phosphate isomerase",
		shortName: "TPI",
		kind: "enzyme",
		order: 5,
	},
	{
		id: "glyceraldehyde_3_phosphate_dehydrogenase",
		name: "Glyceraldehyde-3-phosphate dehydrogenase",
		shortName: "GAPDH",
		kind: "enzyme",
		order: 6,
	},
	{
		id: "phosphoglycerate_kinase",
		name: "Phosphoglycerate kinase",
		shortName: "PGK",
		kind: "enzyme",
		order: 7,
	},
	{
		id: "phosphoglycerate_mutase",
		name: "Phosphoglycerate mutase",
		shortName: "PGM",
		kind: "enzyme",
		order: 8,
	},
	{
		id: "enolase",
		name: "Enolase",
		shortName: "ENO",
		kind: "enzyme",
		order: 9,
	},
	{
		id: "pyruvate_kinase",
		name: "Pyruvate kinase",
		shortName: "PK",
		kind: "enzyme",
		order: 10,
	},
] as const satisfies readonly EnzymeDefinition[];

