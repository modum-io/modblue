/// <reference types="node" />
import { Gatt, GattCharacteristicProperty, GattService, ReadFunction, WriteFunction } from '../../../models';
import { HciAdapter } from '../Adapter';
import { Hci } from '../misc';
import { HciPeripheral } from '../Peripheral';
export interface GattServiceInput {
    uuid: string;
    characteristics: GattCharacteristicInput[];
}
export interface GattCharacteristicInput {
    uuid: string;
    properties: GattCharacteristicProperty[];
    secure: GattCharacteristicProperty[];
    value?: Buffer;
    onRead?: ReadFunction;
    onWrite?: WriteFunction;
    descriptors?: GattDescriptorInput[];
}
export interface GattDescriptorInput {
    uuid: string;
    value: Buffer;
}
export declare class HciGattLocal extends Gatt {
    readonly peripheral: HciPeripheral;
    private hci;
    private handles;
    private negotiatedMtus;
    private _deviceName;
    get deviceName(): string;
    private _serviceInputs;
    get serviceInputs(): GattServiceInput[];
    constructor(adapter: HciAdapter, hci: Hci, maxMtu?: number);
    /**
     * Set the data that is used by this GATT service.
     * @param deviceName The name of the advertised device
     * @param services The services contained in the device.
     */
    setData(deviceName: string, services: GattServiceInput[]): void;
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