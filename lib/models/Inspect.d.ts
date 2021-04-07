export declare const CUSTOM: symbol;
declare type Style = 'special' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'null' | 'string' | 'symbol' | 'date' | 'regexp' | 'module';
export interface InspectOptionsStylized {
    depth?: number | null;
    stylize(text: string, styleType: Style): string;
}
export {};
//# sourceMappingURL=Inspect.d.ts.map