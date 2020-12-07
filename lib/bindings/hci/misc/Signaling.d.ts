import { Hci } from './Hci';
export declare class Signaling {
    private hci;
    private handle;
    constructor(hci: Hci, handle: number);
    dispose(): void;
    private onAclStreamData;
    private onHciStateChange;
    private onHciDisconnect;
    private processConnectionParameterUpdateRequest;
}
