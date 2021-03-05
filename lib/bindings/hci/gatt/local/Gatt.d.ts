import { GattLocal } from '../../../../models';
import { HciAdapter } from '../../Adapter';
import { Hci } from '../../misc';
export declare class HciGattLocal extends GattLocal {
    private hci;
    private negotiatedMtus;
    constructor(adapter: HciAdapter, hci: Hci, maxMtu?: number);
    private onHciDisconnect;
    private onAclStreamData;
    private errorResponse;
    private getMtu;
    private handleMtuRequest;
    private handleFindInfoRequest;
    private handleFindByTypeRequest;
    private handleReadByGroupRequest;
    private handleReadByTypeRequest;
    private handleReadOrReadBlobRequest;
    private handleWriteRequestOrCommand;
    private handlePrepareWriteRequest;
    private handleExecuteWriteRequest;
    private handleConfirmation;
}
//# sourceMappingURL=Gatt.d.ts.map