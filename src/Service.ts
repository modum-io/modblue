import { EventEmitter } from 'events';

import { Characteristic } from './Characteristic';
import knownServices from './data/services.json';
import { Noble } from './Noble';

type KnownServices = { [uuid: string]: { name: string; type: string } };

export class Service extends EventEmitter {
	private noble: Noble;
	private peripheralUUID: string;

	public readonly uuid: string;
	public readonly name: string;
	public readonly type: string;

	public includedServiceUUIDs: string[];
	public characteristics: Map<string, Characteristic>;

	public constructor(noble: Noble, peripheralUUID: string, uuid: string) {
		super();

		this.noble = noble;
		this.peripheralUUID = peripheralUUID;

		this.uuid = uuid;
		this.name = null;
		this.type = null;

		this.includedServiceUUIDs = [];
		this.characteristics = new Map();

		const service = (knownServices as KnownServices)[uuid];
		if (service) {
			this.name = service.name;
			this.type = service.type;
		}
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			name: this.name,
			type: this.type,
			includedServiceUUIDs: this.includedServiceUUIDs
		});
	}

	public async discoverIncludedServices(serviceUUIDs: string[]) {
		this.noble.discoverIncludedServices(this.peripheralUUID, this.uuid, serviceUUIDs);
		return new Promise<string[]>((resolve) =>
			this.once('includedServicesDiscover', (includedServiceUUIDs) => resolve(includedServiceUUIDs))
		);
	}

	public async discoverCharacteristics(characteristicUUIDs: string[]) {
		this.noble.discoverCharacteristics(this.peripheralUUID, this.uuid, characteristicUUIDs);
		return new Promise<Characteristic[]>((resolve) =>
			this.once('characteristicsDiscover', (characteristics) => resolve(characteristics))
		);
	}
}
