/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../Bindings';
import { AclStream } from './acl-stream';
export declare interface Smp {
    on(event: 'end', listener: () => void): this;
    on(event: 'fail', listener: () => void): this;
    on(event: 'stk', listener: (stk: Buffer) => void): this;
    on(event: 'ltk', listener: (ltk: Buffer) => void): this;
    on(event: 'masterIdent', listener: (ediv: Buffer, rand: Buffer) => void): this;
}
export declare class Smp extends EventEmitter {
    private aclStream;
    private iat;
    private ia;
    private rat;
    private ra;
    private tk;
    private preq;
    private pres;
    private pcnf;
    private r;
    constructor(aclStream: AclStream, localAddressType: AddressType, localAddress: string, remoteAddressType: AddressType, remoteAddress: string);
    sendPairingRequest(): void;
    private onAclStreamData;
    private onAclStreamEnd;
    private handlePairingResponse;
    private handlePairingConfirm;
    private handlePairingRandom;
    private handlePairingFailed;
    private handleEncryptInfo;
    private handleMasterIdent;
    private write;
}
