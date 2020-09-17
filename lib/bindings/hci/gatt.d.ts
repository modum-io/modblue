/// <reference types="node" />
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
export declare class Gatt {
    private aclStream;
    private services;
    private characteristics;
    private descriptors;
    private currentCommand;
    private commandQueue;
    private mtu;
    private security;
    constructor(aclStream: AclStream);
    dispose(): void;
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
    exchangeMtu(mtu: number): Promise<number>;
    discoverServices(uuids: string[]): Promise<GattService[]>;
    private doDiscoverServices;
    discoverIncludedServices(serviceUUID: string, uuids: string[]): Promise<GattService[]>;
    private doDiscoverIncludedServices;
    discoverCharacteristics(serviceUUID: string, uuids: string[]): Promise<GattCharacteristic[]>;
    private doDiscoverCharacteristics;
    read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    private longWrite;
    broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    discoverDescriptors(serviceUUID: string, characteristicUUID: string, uuids: string[]): Promise<GattDescriptor[]>;
    private doDiscoverDescriptors;
    readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
}
