import { BaseCharacteristic } from '../../Characteristic';
import { BaseDescriptor } from '../../Descriptor';

import { BusObject, I_BLUEZ_CHARACTERISTIC } from './BusObject';
import { Noble } from './Noble';
import { Service } from './Service';
import { buildTypedValue } from './TypeValue';

export class Characteristic extends BaseCharacteristic<Noble, Service> {
	private readonly object: BusObject;

	public constructor(noble: Noble, service: Service, uuid: string, properties: string[], object: BusObject) {
		super(noble, service, uuid, properties);

		this.object = object;
	}

	private prop<T>(propName: string) {
		return this.object.prop<T>(I_BLUEZ_CHARACTERISTIC, propName);
	}
	private callMethod<T>(methodName: string, ...args: any[]) {
		return this.object.callMethod<T>(I_BLUEZ_CHARACTERISTIC, methodName, ...args);
	}

	public async read(offset: number = 0) {
		const options = {
			offset: buildTypedValue('uint16', offset)
		};
		const payload = await this.callMethod<any>('ReadValue', options);
		return Buffer.from(payload);
	}

	public async write(data: Buffer, withoutResponse: boolean) {
		const options = {
			offset: buildTypedValue('uint16', 0),
			type: buildTypedValue('string', withoutResponse ? 'command' : 'request')
		};
		await this.callMethod('WriteValue', [...data], options);
	}

	public broadcast(broadcast: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public subscribe(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public unsubscribe(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public getDiscoveredDescriptors(): BaseDescriptor[] {
		throw new Error('Method not implemented.');
	}

	public discoverDescriptors(): Promise<BaseDescriptor[]> {
		throw new Error('Method not implemented.');
	}
}
