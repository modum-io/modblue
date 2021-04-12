import { GattCharacteristic, GattCharacteristicProperty, GattService, ReadFunction, WriteFunction } from "../../../models";

import { MacGattCharacteristic } from "./Characteristic";
import { MacGatt } from "./Gatt";

export class MacGattService extends GattService {
    public readonly gatt: MacGatt;

    public addCharacteristic(uuid: string, props: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], readFuncOrValue?: Buffer | ReadFunction, writeFunc?: WriteFunction): Promise<GattCharacteristic> {
        throw new Error("Method not implemented.");
    }

    public discoverCharacteristics(): Promise<GattCharacteristic[]> {
        const noble = this.gatt.peripheral.adapter.noble;
		
        this.characteristics.clear();
        noble.discoverCharacteristics(this.gatt.peripheral.uuid, this.uuid);

        return new Promise<GattCharacteristic[]>((resolve, reject) => {
            const handler = (uuid: string, serviceUUID: string, characteristics: { uuid: string, properties: GattCharacteristicProperty[] }[]) => {
                if (uuid === this.gatt.peripheral.uuid && serviceUUID === this.uuid) {
                    noble.off("characteristicsDiscover", handler);
                    for (const char of characteristics) {
                        this.characteristics.set(char.uuid, new MacGattCharacteristic(this, char.uuid, true, char.properties, []));
                    }
                    resolve([...this.characteristics.values()]);
                }
            }
            noble.on("characteristicsDiscover", handler);
        });
    }
}
