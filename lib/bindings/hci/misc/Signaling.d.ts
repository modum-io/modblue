/// <reference types="node" />
import { EventEmitter } from 'events';
import { Hci } from './Hci';
export declare interface Signaling {
    on(event: 'connectionParameterUpdateRequest', listener: (minInterval: number, maxInterval: number, latency: number, supervisionTimeout: number) => void): this;
}
export declare class Signaling extends EventEmitter {
    private hci;
    private handle;
    constructor(hci: Hci, handle: number);
    dispose(): void;
    private onAclStreamData;
    private processConnectionParameterUpdateRequest;
}
