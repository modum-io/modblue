import { Peripheral } from '../Peripheral';
export declare class GattError extends Error {
    readonly peripheral: Peripheral;
    details?: string;
    constructor(peripheral: Peripheral, message: string, details?: string);
}
