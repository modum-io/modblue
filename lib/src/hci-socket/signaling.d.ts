/// <reference types="node" />
import { EventEmitter } from 'events';
import { AclStream } from './acl-stream';
export declare class Signaling extends EventEmitter {
    private handle;
    private aclStream;
    constructor(handle: number, aclStream: AclStream);
    private onAclStreamData;
    private onAclStreamEnd;
    private processConnectionParameterUpdateRequest;
}
