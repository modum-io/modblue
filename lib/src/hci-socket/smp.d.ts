/// <reference types="node" />
import { EventEmitter } from 'events';
import { AclStream } from './acl-stream';
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
    constructor(aclStream: AclStream, localAddressType: any, localAddress: any, remoteAddressType: any, remoteAddress: any);
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
