/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../Bindings';
import { Hci } from './hci';
export declare interface AclStream {
    on(event: 'data', listener: (cid: number, data: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'encrypt', listener: (encrypt: number) => void): this;
    on(event: 'encryptFail', listener: () => void): this;
}
export declare class AclStream extends EventEmitter {
    private hci;
    private handle;
    private smp;
    constructor(hci: Hci, handle: number, localAddressType: AddressType, localAddress: string, remoteAddressType: AddressType, remoteAddress: string);
    encrypt(): void;
    write(cid: number, data: Buffer): void;
    push(cid: number, data: Buffer): void;
    pushEncrypt(encrypt: number): void;
    private onSmpStk;
    private onSmpFail;
    private onSmpEnd;
}
