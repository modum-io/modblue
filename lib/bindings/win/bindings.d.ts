/// <reference types="node" />
import EventEmitter from 'events';
declare global {
    let Windows: any;
}
export interface Radio extends EventEmitter {
    kind: string;
    name: string;
    state: string;
}
export declare class NobleBindings extends EventEmitter {
    private _radio;
    private _radioState;
    private _deviceMap;
    private _devicesListeners;
    private _acceptOnlyScanResponse;
    private _advertisementWatcher;
    private _filterAdvertisementServiceUuids;
    private _allowAdvertisementDuplicates;
    static getAdapterList(): Promise<Radio[]>;
    constructor(radio: Radio);
    init(): void;
    startScanning(serviceUuids?: string[], allowDuplicates?: boolean): void;
    stopScanning(): void;
    connect(deviceUuid: string): void;
    disconnect(deviceUuid: string): void;
    discoverServices(deviceUuid: string, filterServiceUuids?: string[]): void;
    discoverIncludedServices(deviceUuid: string, serviceUuid: string, filterServiceUuids?: string[]): void;
    discoverCharacteristics(deviceUuid: string, serviceUuid: string, filterCharacteristicUuids?: string[]): void;
    read(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void;
    write(deviceUuid: string, serviceUuid: string, characteristicUuid: string, data: Buffer, withoutResponse: boolean): void;
    notify(deviceUuid: string, serviceUuid: string, characteristicUuid: string, notify: boolean): void;
    discoverDescriptors(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void;
    readValue(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): void;
    writeValue(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string, data: Buffer): void;
    private _updateRadioState;
    private _onAdvertisementWatcherReceived;
    private _onAdvertisementWatcherStopped;
    private _onConnectionStatusChanged;
    private _getCachedServiceAsync;
    private _getCachedCharacteristicAsync;
    private _getCachedDescriptorAsync;
}
//# sourceMappingURL=bindings.d.ts.map