import { Gatt, GattService } from '../../../models';
import { HciAdapter } from '../Adapter';
import { Hci } from '../misc';
import { HciPeripheral } from '../Peripheral';
import { HciGattService } from './Service';
export declare class HciGattLocal extends Gatt {
    readonly peripheral: HciPeripheral;
    readonly services: Map<string, HciGattService>;
    private hci;
    private handles;
    private negotiatedMtus;
    private _deviceName;
    get deviceName(): string;
    constructor(adapter: HciAdapter, hci: Hci, maxMtu?: number);
    addService(uuid: string): Promise<GattService>;
    prepare(name: string): Promise<void>;
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
    discoverServices(): Promise<GattService[]>;
}
//# sourceMappingURL=GattLocal.d.ts.map