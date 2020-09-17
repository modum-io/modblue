/// <reference types="node" />
import { EventEmitter } from 'events';
import { AclStream } from './acl-stream';
export declare interface Signaling {
    on(event: 'connectionParameterUpdateRequest', listener: (minInterval: number, maxInterval: number, latency: number, supervisionTimeout: number) => void): this;
}
export declare class Signaling extends EventEmitter {
    private aclStream;
    constructor(aclStream: AclStream);
    private onAclStreamData;
    private onAclStreamEnd;
    private processConnectionParameterUpdateRequest;
}
