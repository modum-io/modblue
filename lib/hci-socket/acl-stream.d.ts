/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class AclStream extends EventEmitter {
    private hci;
    private handle;
    private smp;
    constructor(hci: any, handle: number, localAddressType: any, localAddress: any, remoteAddressType: any, remoteAddress: any);
    encrypt(): void;
    write(cid: any, data: Buffer): void;
    push(cid: any, data: Buffer): void;
    pushEncrypt(encrypt: any): void;
    private onSmpStk;
    private onSmpFail;
    private onSmpEnd;
}
