import { GattCharacteristic, GattDescriptor } from "../../../models";

import { MacGattService } from "./Service";

export class MacGattCharacteristic extends GattCharacteristic {
    public readonly service: MacGattService;

    public discoverDescriptors(): Promise<GattDescriptor[]> {
        throw new Error("Method not implemented.");
    }
    public read(): Promise<Buffer> {
        const noble = this.service.gatt.peripheral.adapter.noble;
		
        noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);

        return new Promise<Buffer>((resolve, reject) => {
            const handler = (uuid: string, serviceUUID: string, charUUID: string, data: Buffer) => {
                if (uuid === this.service.gatt.peripheral.uuid && serviceUUID === this.service.uuid && charUUID === this.uuid) {
                    noble.off("read", handler);
                    resolve(data);
                }
            }
            noble.on("read", handler);
        });
    }
    public write(data: Buffer, withoutResponse: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public broadcast(broadcast: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public notify(notify: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public addDescriptor(uuid: string, value: Buffer): Promise<GattDescriptor> {
        throw new Error("Method not implemented.");
    }
}
