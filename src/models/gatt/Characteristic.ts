import { EventEmitter } from 'events';

import { GattService } from './Service';

export type GattCharacteristicProperty =
	| 'broadcast'
	| 'read'
	| 'writeWithoutResponse'
	| 'write'
	| 'notify'
	| 'indicate'
	| 'authenticatedSignedWrites'
	| 'extendedProperties';

export abstract class GattCharacteristic extends EventEmitter {
	public readonly service: GattService;

	public readonly uuid: string;

	public readonly properties: GattCharacteristicProperty[];

	public constructor(service: GattService, uuid: string, properties: GattCharacteristicProperty[]) {
		super();

		this.service = service;

		this.uuid = uuid;
		this.properties = properties;
	}

	public toString() {
		return JSON.stringify({
			serviceUUID: this.service.uuid,
			uuid: this.uuid,
			properties: this.properties
		});
	}
}
