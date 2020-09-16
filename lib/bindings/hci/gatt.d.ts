/// <reference types="node" />
import { EventEmitter } from 'events';
import { AclStream } from './acl-stream';
export interface GattService {
    uuid: string;
    startHandle: number;
    endHandle: number;
}
export interface GattCharacteristic {
    uuid: string;
    startHandle: number;
    endHandle?: number;
    propertiesFlags: number;
    properties: string[];
    valueHandle: number;
}
export interface GattDescriptor {
    uuid: string;
    handle: number;
}
export declare interface Gatt {
    on(event: 'mtu', listener: (mtu: number) => void): this;
    on(event: 'servicesDiscovered', listener: (services: GattService[]) => void): this;
    on(event: 'includedServicesDiscovered', listener: (serviceUUID: string, includedServices: GattService[]) => void): this;
    on(event: 'characteristicsDiscovered', listener: (serviceUUID: string, characteristics: GattCharacteristic[]) => void): this;
    on(event: 'read', listener: (serviceUUID: string, characteristicUUID: string, data: Buffer) => void): this;
    on(event: 'write', listener: (serviceUUID: string, characteristicUUID: string) => void): this;
    on(event: 'broadcast', listener: (serviceUUID: string, characteristicUUID: string, broadcast: boolean) => void): this;
    on(event: 'notify', listener: (serviceUUID: string, characteristicUUID: string, notify: boolean) => void): this;
    on(event: 'notification', listener: (serviceUUID: string, characteristicUUID: string, valueData: Buffer) => void): this;
    on(event: 'descriptorsDiscovered', listener: (serviceUUID: string, characteristicUUID: string, descriptors: GattDescriptor[]) => void): this;
    on(event: 'valueRead', listener: (serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) => void): this;
    on(event: 'valueWrite', listener: (serviceUUID: string, characteristicUUID: string, descriptorUUID: string) => void): this;
    on(event: 'handleRead', listener: (handle: number, data: Buffer) => void): this;
    on(event: 'handleWrite', listener: (handle: number) => void): this;
    on(event: 'handleNotify', listener: (valueHandle: number, valueData: Buffer) => void): this;
    on(event: 'handleConfirmation', listener: (valueHandle: number) => void): this;
}
export declare class Gatt extends EventEmitter {
    private aclStream;
    private services;
    private characteristics;
    private descriptors;
    private currentCommand;
    private commandQueue;
    private mtu;
    private security;
    constructor(aclStream: AclStream);
    private onAclStreamData;
    private onAclStreamEncrypt;
    private onAclStreamEncryptFail;
    private onAclStreamEnd;
    private writeAtt;
    private errorResponse;
    private queueCommand;
    private mtuRequest;
    readByGroupRequest(startHandle: number, endHandle: number, groupUUID: number): Buffer;
    readByTypeRequest(startHandle: number, endHandle: number, groupUUID: number): Buffer;
    readRequest(handle: number): Buffer;
    readBlobRequest(handle: number, offset: number): Buffer;
    findInfoRequest(startHandle: number, endHandle: number): Buffer;
    writeRequest(handle: number, data: Buffer, withoutResponse: boolean): Buffer;
    private prepareWriteRequest;
    private executeWriteRequest;
    private handleConfirmation;
    exchangeMtu(mtu: number): void;
    discoverServices(uuids: string[]): void;
    discoverIncludedServices(serviceUUID: string, uuids: string[]): void;
    discoverCharacteristics(serviceUUID: string, characteristicUUIDs: string[]): void;
    read(serviceUUID: string, characteristicUUID: string): void;
    write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): void;
    private longWrite;
    broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): void;
    notify(serviceUUID: string, characteristicUUID: string, notify: boolean): void;
    discoverDescriptors(serviceUUID: string, characteristicUUID: string): void;
    readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): void;
    writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): void;
    readHandle(handle: number): void;
    writeHandle(handle: number, data: Buffer, withoutResponse: boolean): void;
}
