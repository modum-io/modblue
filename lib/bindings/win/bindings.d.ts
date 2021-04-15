/// <reference types="node" />
import EventEmitter from 'events';
interface AdvertisementEvent {
    bluetoothAddress: number;
    advertisementType: string;
    advertisement: {
        localName: string;
        serviceUuids: string[];
        dataSections: {
            dataType: string;
            data: Buffer;
        }[];
        manufacturerData: any;
    };
    rawSignalStrengthInDBm: number;
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
    init(): void;
    startScanning(serviceUuids?: string[], allowDuplicates?: boolean): void;
    stopScanning(): void;
    connect(deviceUuid: string): void;
    disconnect(deviceUuid: string): void;
    updateRssi(deviceUuid: string): void;
    discoverServices(deviceUuid: string, filterServiceUuids?: string[]): void;
    discoverIncludedServices(deviceUuid: string, serviceUuid: string, filterServiceUuids?: string[]): void;
    discoverCharacteristics(deviceUuid: string, serviceUuid: string, filterCharacteristicUuids?: string[]): void;
    read(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void;
    write(deviceUuid: string, serviceUuid: string, characteristicUuid: string, data: Buffer, withoutResponse: boolean): void;
    notify(deviceUuid: string, serviceUuid: string, characteristicUuid: string, notify: boolean): void;
    discoverDescriptors(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void;
    readValue(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): Promise<void>;
    writeValue(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string, data: Buffer): void;
    _updateRadioState(): void;
    _onAdvertisementWatcherReceived: (sender: unknown, e: AdvertisementEvent) => void;
    _onAdvertisementWatcherStopped: (sender: unknown, e: any) => void;
    _onConnectionStatusChanged: (sender: any, e: any) => void;
    _getCachedServiceAsync(deviceUuid: string, serviceUuid: string): Promise<any>;
    _getCachedCharacteristicAsync(deviceUuid: string, serviceUuid: string, characteristicUuid: string): Promise<any>;
    _getCachedDescriptorAsync(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): Promise<any>;
}
export {};
//# sourceMappingURL=bindings.d.ts.map