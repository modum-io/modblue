import { Variant } from 'dbus-next';
declare const MAPPINGS: {
    string: string;
    int16: string;
    boolean: string;
    uint16: string;
    dict: string;
    array: string;
    variant: string;
};
export declare function buildTypedValue(types: keyof typeof MAPPINGS | (keyof typeof MAPPINGS)[], value: unknown): Variant;
export {};
//# sourceMappingURL=TypeValue.d.ts.map