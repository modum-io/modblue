/// <reference types="node" />
import { GattRemote, GattService, Peripheral } from '../../../models';
import { Hci } from '../misc';
import { HciPeripheral } from '../Peripheral';
import { HciGattCharacteristic } from './Characteristic';
import { HciGattDescriptor } from './Descriptor';
import { HciGattService } from './Service';
export declare class HciGattRemote extends GattRemote {
    readonly peripheral: HciPeripheral;
    readonly services: Map<string, HciGattService>;
    private hci;
    private handle;
    private security;
    private mtuWasExchanged;
    private disposeReason;
    private mutex;
    private mutexStack;
    private currentCmd;
    private cmdTimeout;
    constructor(peripheral: Peripheral, hci: Hci, handle: number, cmdTimeout?: number);
    private acquireMutex;
    dispose(reason?: string): void;
    private onAclStreamData;
    private errorResponse;
    private queueCommand;
    private mtuRequest;
    readByGroupRequest(startHandle: number, endHandle: number, groupUUID: number): Promise<Buffer>;
    readByTypeRequest(startHandle: number, endHandle: number, groupUUID: number): Promise<Buffer>;
    readRequest(handle: number): Promise<Buffer>;
    readBlobRequest(handle: number, offset: number): Promise<Buffer>;
    findInfoRequest(startHandle: number, endHandle: number): Promise<Buffer>;
    writeRequest(handle: number, data: Buffer, withoutResponse: false): Promise<Buffer>;
    writeRequest(handle: number, data: Buffer, withoutResponse: true): Promise<void>;
    private prepareWriteRequest;
    private executeWriteRequest;
    private handleConfirmation;
    exchangeMtu(mtu: number): Promise<number>;
    discoverServices(): Promise<HciGattService[]>;
    discoverCharacteristics(serviceUUID: string): Promise<HciGattCharacteristic[]>;
    readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    writeCharacteristic(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    private longWrite;
    broadcastCharacteristic(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    notifyCharacteristic(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<HciGattDescriptor[]>;
    readDescriptor(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    writeDescriptor(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
    addService(): Promise<GattService>;
    prepare(): Promise<void>;
}
//# sourceMappingURL=GattRemote.d.ts.map