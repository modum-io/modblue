import { inspect } from 'util';

export const CUSTOM = inspect.custom;

type Style =
	| 'special'
	| 'number'
	| 'bigint'
	| 'boolean'
	| 'undefined'
	| 'null'
	| 'string'
	| 'symbol'
	| 'date'
	| 'regexp'
	| 'module';

export interface InspectOptionsStylized {
	depth?: number | null;
	stylize(text: string, styleType: Style): string;
}
