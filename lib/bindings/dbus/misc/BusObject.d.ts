import { MessageBus } from 'dbus-next';
export declare const I_BLUEZ_ADAPTER = "org.bluez.Adapter1";
export declare const I_BLUEZ_DEVICE = "org.bluez.Device1";
export declare const I_BLUEZ_SERVICE = "org.bluez.GattService1";
export declare const I_BLUEZ_CHARACTERISTIC = "org.bluez.GattCharacteristic1";
export declare const I_PROPERTIES = "org.freedesktop.DBus.Properties";
export declare const I_OBJECT_MANAGER = "org.freedesktop.DBus.ObjectManager";
export declare class BusObject {
    private readonly dbus;
    readonly serviceName: string;
    readonly objectName: string;
    private _object;
    private getObject;
    constructor(dbus: MessageBus, serviceName: string, objectName: string);
    getChild(childName: string): BusObject;
    getChildrenNames(): Promise<string[]>;
    getInterface(interfaceName: string): Promise<import("dbus-next").ClientInterface>;
    getPropertiesInterface(): Promise<import("dbus-next").ClientInterface>;
    prop<T = string>(interfaceName: string, propName: string): Promise<T>;
    callMethod<T = void>(interfaceName: string, methodName: string, ...args: any[]): Promise<T>;
    on(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void): Promise<void>;
    once(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void): Promise<void>;
    off(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void): Promise<void>;
}
