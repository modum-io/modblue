import { GattCharacteristic, GattCharacteristicProperty, GattService } from '../../../models';
import { I_BLUEZ_CHARACTERISTIC, I_OBJECT_MANAGER } from '../misc';

import { DbusGattCharacteristic } from './Characteristic';
import { DbusGatt } from './Gatt';

export class DbusGattService extends GattService {
	public readonly gatt: DbusGatt;
	public readonly characteristics: Map<string, DbusGattCharacteristic> = new Map();

	public readonly path: string;

	private get dbus() {
		return this.gatt.peripheral.adapter.modblue.dbus;
	}

	public constructor(gatt: DbusGatt, uuid: string, isRemote: boolean, path: string) {
		super(gatt, uuid, isRemote);

		this.path = path;
	}

	public async discoverCharacteristics(): Promise<GattCharacteristic[]> {
		const objManager = await this.dbus.getProxyObject(`org.bluez`, '/');
		const objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);

		const objs = await objManagerIface.GetManagedObjects();
		const keys = Object.keys(objs);

		this.characteristics.clear();
		for (const charPath of keys) {
			if (!charPath.startsWith(this.path)) {
				continue;
			}

			const charObj = objs[charPath][I_BLUEZ_CHARACTERISTIC];
			if (!charObj) {
				continue;
			}

			const uuid = charObj.UUID.value.replace(/-/g, '');
			const properties = (charObj.Flags.value as string[]).filter((p) => !p.startsWith('secure-'));
			const secure = properties.filter((p) => p.startsWith('encrypt')).map((p) => p.replace('encrypt-', ''));
			const characteristic = new DbusGattCharacteristic(
				this,
				uuid,
				true,
				properties as GattCharacteristicProperty[],
				secure as GattCharacteristicProperty[],
				charPath
			);

			this.characteristics.set(characteristic.uuid, characteristic);
		}

		return [...this.characteristics.values()];
	}

	public async addCharacteristic(): Promise<GattCharacteristic> {
		throw new Error('Method not implemented.');
	}
}
