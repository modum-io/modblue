import { GattCharacteristic, GattCharacteristicProperty, GattService } from '../../../models';

import { WebGatt } from './Gatt';
import { WebGattCharacteristic } from './Characteristic';

export class WebGattService extends GattService {
	public readonly gatt: WebGatt;
	public readonly characteristics: Map<string, WebGattCharacteristic> = new Map();

	private srv: BluetoothRemoteGATTService;

	public constructor(gatt: WebGatt, service: BluetoothRemoteGATTService) {
		super(gatt, service.uuid, true);

		this.srv = service;
	}

	public async discoverCharacteristics(): Promise<GattCharacteristic[]> {
		const newChars = await this.srv.getCharacteristics();

		this.characteristics.clear();
		for (const char of newChars) {
			const props: GattCharacteristicProperty[] = [];
			if (char.properties.read) {
				props.push('read');
			}
			if (char.properties.write) {
				props.push('write');
			}
			if (char.properties.writeWithoutResponse) {
				props.push('write-without-response');
			}
			if (char.properties.broadcast) {
				props.push('broadcast');
			}
			if (char.properties.notify) {
				props.push('notify');
			}
			if (char.properties.indicate) {
				props.push('indicate');
			}
			if (char.properties.reliableWrite) {
				props.push('reliable-write');
			}
			if (char.properties.writableAuxiliaries) {
				props.push('writable-auxiliaries');
			}
			if (char.properties.authenticatedSignedWrites) {
				props.push('authenticated-signed-writes');
			}
			this.characteristics.set(char.uuid, new WebGattCharacteristic(this, char, props, []));
		}
		return [...this.characteristics.values()];
	}
}
