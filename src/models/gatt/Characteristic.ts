import { EventEmitter } from 'events';

import { GattService } from './Service';

// tslint:disable: no-bitwise

export type GattCharacteristicProperty =
	| 'broadcast'
	| 'read'
	| 'write-without-response'
	| 'write'
	| 'notify'
	| 'indicate'
	| 'authenticated-signed-writes'
	| 'extended-properties'
	| 'reliable-write'
	| 'writable-auxiliaries'
	| 'authorize';

export abstract class GattCharacteristic extends EventEmitter {
	public readonly service: GattService;

	public readonly uuid: string;

	public readonly properties: GattCharacteristicProperty[];
	public readonly propertyFlag: number;
	public readonly secure: GattCharacteristicProperty[];
	public readonly secureFlag: number;

	public constructor(
		service: GattService,
		uuid: string,
		propsOrFlag: number | GattCharacteristicProperty[],
		secureOrFlag: number | GattCharacteristicProperty[]
	) {
		super();

		this.service = service;

		this.uuid = uuid;

		let properties: GattCharacteristicProperty[] = [];
		let secure: GattCharacteristicProperty[] = [];
		let propertyFlag = 0;
		let secureFlag = 0;

		if (typeof propsOrFlag === 'object') {
			properties = propsOrFlag;

			if (propsOrFlag.includes('read')) {
				propertyFlag |= 0x02;
			}
			if (propsOrFlag.includes('write-without-response')) {
				propertyFlag |= 0x04;
			}
			if (propsOrFlag.includes('write')) {
				propertyFlag |= 0x08;
			}
			if (propsOrFlag.includes('notify')) {
				propertyFlag |= 0x10;
			}
			if (propsOrFlag.includes('indicate')) {
				propertyFlag |= 0x20;
			}
		} else {
			propertyFlag = propsOrFlag;

			if (propsOrFlag & 0x01) {
				properties.push('broadcast');
			}
			if (propsOrFlag & 0x02) {
				properties.push('read');
			}
			if (propsOrFlag & 0x04) {
				properties.push('write-without-response');
			}
			if (propsOrFlag & 0x08) {
				properties.push('write');
			}
			if (propsOrFlag & 0x10) {
				properties.push('notify');
			}
			if (propsOrFlag & 0x20) {
				properties.push('indicate');
			}
			if (propsOrFlag & 0x40) {
				properties.push('authenticated-signed-writes');
			}
			if (propsOrFlag & 0x80) {
				properties.push('extended-properties');
			}
		}

		if (typeof secureOrFlag === 'object') {
			secure = secureOrFlag;

			if (secureOrFlag.includes('read')) {
				secureFlag |= 0x02;
			}
			if (secureOrFlag.includes('write-without-response')) {
				secureFlag |= 0x04;
			}
			if (secureOrFlag.includes('write')) {
				secureFlag |= 0x08;
			}
			if (secureOrFlag.includes('notify')) {
				secureFlag |= 0x10;
			}
			if (secureOrFlag.includes('indicate')) {
				secureFlag |= 0x20;
			}
		} else {
			secureFlag = secureOrFlag;

			if (secureOrFlag & 0x01) {
				secure.push('broadcast');
			}
			if (secureOrFlag & 0x02) {
				secure.push('read');
			}
			if (secureOrFlag & 0x04) {
				secure.push('write-without-response');
			}
			if (secureOrFlag & 0x08) {
				secure.push('write');
			}
			if (secureOrFlag & 0x10) {
				secure.push('notify');
			}
			if (secureOrFlag & 0x20) {
				secure.push('indicate');
			}
			if (secureOrFlag & 0x40) {
				secure.push('authenticated-signed-writes');
			}
			if (secureOrFlag & 0x80) {
				secure.push('extended-properties');
			}
		}

		this.properties = properties;
		this.secure = secure;
		this.propertyFlag = propertyFlag;
		this.secureFlag = secureFlag;
	}

	public toString() {
		return JSON.stringify({
			serviceUUID: this.service.uuid,
			uuid: this.uuid,
			properties: this.properties,
			secure: this.secure
		});
	}
}
