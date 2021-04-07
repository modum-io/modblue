import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';

import { WebGattDescriptor } from './Descriptor';
import { WebGattService } from './Service';

export class WebGattCharacteristic extends GattCharacteristic {
	public readonly service: WebGattService;
	public readonly descriptors: Map<string, WebGattDescriptor> = new Map();

	private char: BluetoothRemoteGATTCharacteristic;

	public constructor(
		service: WebGattService,
		characteristic: BluetoothRemoteGATTCharacteristic,
		properties: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[]
	) {
		super(service, characteristic.uuid, true, properties, secure);

		this.char = characteristic;
	}

	public async discoverDescriptors(): Promise<GattDescriptor[]> {
		const newDescs = await this.char.getDescriptors();

		this.descriptors.clear();
		for (const desc of newDescs) {
			this.descriptors.set(desc.uuid, new WebGattDescriptor(this, desc));
		}
		return [...this.descriptors.values()];
	}

	public async read(): Promise<Buffer> {
		const view = await this.char.readValue();
		return view.buffer as Buffer;
	}

	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		if (withoutResponse) {
			await this.char.writeValueWithoutResponse(data);
		} else {
			await this.char.writeValueWithResponse(data);
		}
	}

	public async broadcast(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async notify(notify: boolean): Promise<void> {
		if (notify) {
			await this.char.startNotifications();
			this.char.addEventListener('characteristicvaluechanged', this.onValueChanged);
		} else {
			await this.char.stopNotifications();
			this.char.removeEventListener('characteristicvaluechanged', this.onValueChanged);
		}
	}

	private onValueChanged = (event: Event) => {
		this.emit('notification', (event.target as BluetoothRemoteGATTCharacteristic).value.buffer as Buffer);
	};
}
