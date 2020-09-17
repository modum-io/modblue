import { EventEmitter } from 'events';

import { BaseDescriptor } from './Descriptor';
import { BaseNoble } from './Noble';
import { BaseService } from './Service';

export abstract class BaseCharacteristic<
	N extends BaseNoble = BaseNoble,
	S extends BaseService = BaseService
> extends EventEmitter {
	protected readonly noble: N;

	public readonly service: S;

	public readonly uuid: string;

	public readonly properties: string[];

	public constructor(noble: N, service: S, uuid: string, properties: string[]) {
		super();

		this.noble = noble;
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

	public abstract async read(): Promise<Buffer>;
	public abstract async write(data: Buffer, withoutResponse: boolean): Promise<void>;

	public abstract async broadcast(broadcast: boolean): Promise<void>;

	public abstract async subscribe(): Promise<void>;
	public abstract async unsubscribe(): Promise<void>;

	public abstract getDiscoveredDescriptors(): BaseDescriptor[];

	public abstract async discoverDescriptors(): Promise<BaseDescriptor[]>;
}
