import { Peripheral } from '../Peripheral';
export declare class GattError extends Error {
    readonly peripheral: Peripheral;
    readonly details?: string;
    constructor(peripheral: Peripheral, message: string, details?: string);
}
