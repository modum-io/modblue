/// <reference types="node" />
import { Gatt, GattCharacteristic, GattCharacteristicProperty, GattDescriptor, GattService, ReadFunction, WriteFunction } from '../../../../models';
import { HciAdapter } from '../../Adapter';
import { Hci } from '../../misc';
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
    protected doDiscoverServices(): Promise<GattService[]>;
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
    readCharacteristic(): Promise<Buffer>;
    writeCharacteristic(): Promise<void>;
    broadcastCharacteristic(): Promise<void>;
    notifyCharacteristic(): Promise<void>;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    readDescriptor(): Promise<Buffer>;
    writeDescriptor(): Promise<void>;
}
//# sourceMappingURL=Gatt.d.ts.map