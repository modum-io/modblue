import { EventEmitter } from 'events';

import { GattCharacteristic, GattDescriptor, GattService } from '../../Bindings';

import { AclStream } from './acl-stream';

/* eslint-disable no-unused-vars */
// tslint:disable: no-bitwise
const ATT_OP_ERROR = 0x01;
const ATT_OP_MTU_REQ = 0x02;
const ATT_OP_MTU_RESP = 0x03;
const ATT_OP_FIND_INFO_REQ = 0x04;
const ATT_OP_FIND_INFO_RESP = 0x05;
const ATT_OP_READ_BY_TYPE_REQ = 0x08;
const ATT_OP_READ_BY_TYPE_RESP = 0x09;
const ATT_OP_READ_REQ = 0x0a;
const ATT_OP_READ_RESP = 0x0b;
const ATT_OP_READ_BLOB_REQ = 0x0c;
const ATT_OP_READ_BLOB_RESP = 0x0d;
const ATT_OP_READ_BY_GROUP_REQ = 0x10;
const ATT_OP_READ_BY_GROUP_RESP = 0x11;
const ATT_OP_WRITE_REQ = 0x12;
const ATT_OP_WRITE_RESP = 0x13;
const ATT_OP_PREPARE_WRITE_REQ = 0x16;
const ATT_OP_PREPARE_WRITE_RESP = 0x17;
const ATT_OP_EXECUTE_WRITE_REQ = 0x18;
const ATT_OP_EXECUTE_WRITE_RESP = 0x19;
const ATT_OP_HANDLE_NOTIFY = 0x1b;
const ATT_OP_HANDLE_IND = 0x1d;
const ATT_OP_HANDLE_CNF = 0x1e;
const ATT_OP_WRITE_CMD = 0x52;

const ATT_ECODE_SUCCESS = 0x00;
const ATT_ECODE_INVALID_HANDLE = 0x01;
const ATT_ECODE_READ_NOT_PERM = 0x02;
const ATT_ECODE_WRITE_NOT_PERM = 0x03;
const ATT_ECODE_INVALID_PDU = 0x04;
const ATT_ECODE_AUTHENTICATION = 0x05;
const ATT_ECODE_REQ_NOT_SUPP = 0x06;
const ATT_ECODE_INVALID_OFFSET = 0x07;
const ATT_ECODE_AUTHORIZATION = 0x08;
const ATT_ECODE_PREP_QUEUE_FULL = 0x09;
const ATT_ECODE_ATTR_NOT_FOUND = 0x0a;
const ATT_ECODE_ATTR_NOT_LONG = 0x0b;
const ATT_ECODE_INSUFF_ENCR_KEY_SIZE = 0x0c;
const ATT_ECODE_INVAL_ATTR_VALUE_LEN = 0x0d;
const ATT_ECODE_UNLIKELY = 0x0e;
const ATT_ECODE_INSUFF_ENC = 0x0f;
const ATT_ECODE_UNSUPP_GRP_TYPE = 0x10;
const ATT_ECODE_INSUFF_RESOURCES = 0x11;

const GATT_PRIM_SVC_UUID = 0x2800;
const GATT_INCLUDE_UUID = 0x2802;
const GATT_CHARAC_UUID = 0x2803;

const GATT_CLIENT_CHARAC_CFG_UUID = 0x2902;
const GATT_SERVER_CHARAC_CFG_UUID = 0x2903;

const ATT_CID = 0x0004;
/* eslint-enable no-unused-vars */

interface GattCommand {
	buffer: Buffer;
	callback?: (data: Buffer) => void;
	writeCallback?: () => void;
}

export declare interface Gatt {
	on(event: 'mtu', listener: (address: string, mtu: number) => void): this;
	on(event: 'servicesDiscover', listener: (address: string, discoveredServices: GattService[]) => void): this;
	on(event: 'servicesDiscovered', listener: (address: string, services: GattService[]) => void): this;
	on(
		event: 'includedServicesDiscover',
		listener: (address: string, serviceUUID: string, includedServiceUUIDs: string[]) => void
	): this;
	on(
		event: 'characteristicsDiscover',
		listener: (address: string, serviceUUID: string, discoveredCharacteristics: GattCharacteristic[]) => void
	): this;
	on(
		event: 'characteristicsDiscovered',
		listener: (address: string, serviceUUID: string, characteristics: GattCharacteristic[]) => void
	): this;
	on(
		event: 'read',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, data: Buffer) => void
	): this;
	on(event: 'write', listener: (address: string, serviceUUID: string, characteristicUUID: string) => void): this;
	on(
		event: 'broadcast',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, broadcast: boolean) => void
	): this;
	on(
		event: 'notify',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, notify: boolean) => void
	): this;
	on(
		event: 'notification',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, valueData: Buffer) => void
	): this;
	on(
		event: 'descriptorsDiscover',
		listener: (
			address: string,
			serviceUUID: string,
			characteristicUUID: string,
			discoveredDescriptors: GattDescriptor[]
		) => void
	): this;
	on(
		event: 'descriptorsDiscovered',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, descriptors: GattDescriptor[]) => void
	): this;
	on(
		event: 'valueRead',
		listener: (
			address: string,
			serviceUUID: string,
			characteristicUUID: string,
			descriptorUUID: string,
			data: Buffer
		) => void
	): this;
	on(
		event: 'valueWrite',
		listener: (address: string, serviceUUID: string, characteristicUUID: string, descriptorUUID: string) => void
	): this;
	on(event: 'handleRead', listener: (address: string, handle: number, data: Buffer) => void): this;
	on(event: 'handleWrite', listener: (address: string, handle: number) => void): this;
	on(event: 'handleNotify', listener: (address: string, valueHandle: number, valueData: Buffer) => void): this;
	on(event: 'handleConfirmation', listener: (address: string, valueHandle: number) => void): this;
}

export class Gatt extends EventEmitter {
	private address: string;
	private aclStream: AclStream;

	private services: Map<string, GattService>;
	private characteristics: Map<string, Map<string, GattCharacteristic>>;
	private descriptors: Map<string, Map<string, Map<string, GattDescriptor>>>;

	private currentCommand: GattCommand;
	private commandQueue: GattCommand[];

	private mtu: number;
	private security: string;

	public constructor(address: string, aclStream: AclStream) {
		super();

		this.address = address;
		this.aclStream = aclStream;

		this.services = new Map();
		this.characteristics = new Map();
		this.descriptors = new Map();

		this.currentCommand = null;
		this.commandQueue = [];

		this.mtu = 23;
		this.security = 'low';

		this.aclStream.on('data', this.onAclStreamData);
		this.aclStream.on('encrypt', this.onAclStreamEncrypt);
		this.aclStream.on('encryptFail', this.onAclStreamEncryptFail);
		this.aclStream.on('end', this.onAclStreamEnd);
	}

	private onAclStreamData = (cid: number, data: Buffer) => {
		if (cid !== ATT_CID) {
			return;
		}

		if (this.currentCommand && data.toString('hex') === this.currentCommand.buffer.toString('hex')) {
			// NO-OP
		} else if (data[0] % 2 === 0) {
			if (process.env.NOBLE_MULTI_ROLE) {
				// NO-OP
			} else {
				const requestType = data[0];
				this.writeAtt(this.errorResponse(requestType, 0x0000, ATT_ECODE_REQ_NOT_SUPP));
			}
		} else if (data[0] === ATT_OP_HANDLE_NOTIFY || data[0] === ATT_OP_HANDLE_IND) {
			const valueHandle = data.readUInt16LE(1);
			const valueData = data.slice(3);

			this.emit('handleNotify', this.address, valueHandle, valueData);

			if (data[0] === ATT_OP_HANDLE_IND) {
				this.queueCommand(this.handleConfirmation(), null, () => {
					this.emit('handleConfirmation', this.address, valueHandle);
				});
			}

			for (const serviceUuid of this.services.keys()) {
				for (const characteristicUuid in this.characteristics.get(serviceUuid).keys()) {
					if (this.characteristics.get(serviceUuid).get(characteristicUuid).valueHandle === valueHandle) {
						this.emit('notification', this.address, serviceUuid, characteristicUuid, valueData);
					}
				}
			}
		} else if (!this.currentCommand) {
			// NO-OP
		} else {
			if (
				data[0] === ATT_OP_ERROR &&
				(data[4] === ATT_ECODE_AUTHENTICATION ||
					data[4] === ATT_ECODE_AUTHORIZATION ||
					data[4] === ATT_ECODE_INSUFF_ENC) &&
				this.security !== 'medium'
			) {
				this.aclStream.encrypt();
				return;
			}

			this.currentCommand.callback(data);

			this.currentCommand = null;

			while (this.commandQueue.length) {
				this.currentCommand = this.commandQueue.shift();

				this.writeAtt(this.currentCommand.buffer);

				if (this.currentCommand.callback) {
					break;
				} else if (this.currentCommand.writeCallback) {
					this.currentCommand.writeCallback();

					this.currentCommand = null;
				}
			}
		}
	};

	private onAclStreamEncrypt = (encrypt: number) => {
		if (encrypt) {
			this.security = 'medium';

			this.writeAtt(this.currentCommand.buffer);
		}
	};

	private onAclStreamEncryptFail = () => {
		// NO-OP
	};

	private onAclStreamEnd = () => {
		this.aclStream.off('data', this.onAclStreamData);
		this.aclStream.off('encrypt', this.onAclStreamEncrypt);
		this.aclStream.off('encryptFail', this.onAclStreamEncryptFail);
		this.aclStream.off('end', this.onAclStreamEnd);
	};

	private writeAtt(data: Buffer) {
		this.aclStream.write(ATT_CID, data);
	}

	private errorResponse(opcode: number, handle: number, status: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_ERROR, 0);
		buf.writeUInt8(opcode, 1);
		buf.writeUInt16LE(handle, 2);
		buf.writeUInt8(status, 4);

		return buf;
	}

	private queueCommand(buffer: Buffer, callback?: (data: Buffer) => void, writeCallback?: () => void) {
		this.commandQueue.push({
			buffer: buffer,
			callback: callback,
			writeCallback: writeCallback
		});

		if (this.currentCommand === null) {
			while (this.commandQueue.length) {
				this.currentCommand = this.commandQueue.shift();

				this.writeAtt(this.currentCommand.buffer);

				if (this.currentCommand.callback) {
					break;
				} else if (this.currentCommand.writeCallback) {
					this.currentCommand.writeCallback();

					this.currentCommand = null;
				}
			}
		}
	}

	private mtuRequest(mtu: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(ATT_OP_MTU_REQ, 0);
		buf.writeUInt16LE(mtu, 1);

		return buf;
	}

	public readByGroupRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(ATT_OP_READ_BY_GROUP_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readByTypeRequest(startHandle: number, endHandle: number, groupUUID: number) {
		const buf = Buffer.alloc(7);

		buf.writeUInt8(ATT_OP_READ_BY_TYPE_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);
		buf.writeUInt16LE(groupUUID, 5);

		return buf;
	}

	public readRequest(handle: number) {
		const buf = Buffer.alloc(3);

		buf.writeUInt8(ATT_OP_READ_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		return buf;
	}

	public readBlobRequest(handle: number, offset: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_READ_BLOB_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		return buf;
	}

	public findInfoRequest(startHandle: number, endHandle: number) {
		const buf = Buffer.alloc(5);

		buf.writeUInt8(ATT_OP_FIND_INFO_REQ, 0);
		buf.writeUInt16LE(startHandle, 1);
		buf.writeUInt16LE(endHandle, 3);

		return buf;
	}

	public writeRequest(handle: number, data: Buffer, withoutResponse: boolean) {
		const buf = Buffer.alloc(3 + data.length);

		buf.writeUInt8(withoutResponse ? ATT_OP_WRITE_CMD : ATT_OP_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 3);
		}

		return buf;
	}

	private prepareWriteRequest(handle: number, offset: number, data: Buffer) {
		const buf = Buffer.alloc(5 + data.length);

		buf.writeUInt8(ATT_OP_PREPARE_WRITE_REQ, 0);
		buf.writeUInt16LE(handle, 1);
		buf.writeUInt16LE(offset, 3);

		for (let i = 0; i < data.length; i++) {
			buf.writeUInt8(data.readUInt8(i), i + 5);
		}

		return buf;
	}

	private executeWriteRequest(handle: number, cancelPreparedWrites?: boolean) {
		const buf = Buffer.alloc(2);

		buf.writeUInt8(ATT_OP_EXECUTE_WRITE_REQ, 0);
		buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);

		return buf;
	}

	private handleConfirmation() {
		const buf = Buffer.alloc(1);

		buf.writeUInt8(ATT_OP_HANDLE_CNF, 0);

		return buf;
	}

	public exchangeMtu(mtu: number) {
		this.queueCommand(this.mtuRequest(mtu), (data: Buffer) => {
			const opcode = data[0];

			if (opcode === ATT_OP_MTU_RESP) {
				const newMtu = data.readUInt16LE(1);
				this.mtu = newMtu;
			}

			this.emit('mtu', this.address, this.mtu);
		});
	}

	public discoverServices(uuids: string[]) {
		const services: GattService[] = [];

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_READ_BY_GROUP_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (i = 0; i < num; i++) {
					const offset = 2 + i * type;
					services.push({
						startHandle: data.readUInt16LE(offset),
						endHandle: data.readUInt16LE(offset + 2),
						uuid:
							type === 6
								? data.readUInt16LE(offset + 4).toString(16)
								: data
										.slice(offset + 4)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (opcode !== ATT_OP_READ_BY_GROUP_RESP || services[services.length - 1].endHandle === 0xffff) {
				const servicesDiscovered: GattService[] = [];
				for (i = 0; i < services.length; i++) {
					const uuid = services[i].uuid.trim();
					if ((uuids.length === 0 || uuids.indexOf(uuid) !== -1) && !servicesDiscovered.some((s) => s.uuid === uuid)) {
						servicesDiscovered.push(services[i]);
					}

					this.services.set(services[i].uuid, services[i]);
				}
				this.emit('servicesDiscover', this.address, servicesDiscovered);
				this.emit('servicesDiscovered', this.address, services);
			} else {
				this.queueCommand(
					this.readByGroupRequest(services[services.length - 1].endHandle + 1, 0xffff, GATT_PRIM_SVC_UUID),
					callback
				);
			}
		};

		this.queueCommand(this.readByGroupRequest(0x0001, 0xffff, GATT_PRIM_SVC_UUID), callback);
	}

	public discoverIncludedServices(serviceUUID: string, uuids: string[]) {
		const service = this.services.get(serviceUUID);
		const includedServices: GattService[] = [];

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (i = 0; i < num; i++) {
					const offset = 2 + i * type;
					includedServices.push({
						endHandle: data.readUInt16LE(offset),
						startHandle: data.readUInt16LE(offset + 2),
						uuid:
							type === 8
								? data.readUInt16LE(offset + 6).toString(16)
								: data
										.slice(offset + 6)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (
				opcode !== ATT_OP_READ_BY_TYPE_RESP ||
				includedServices[includedServices.length - 1].endHandle === service.endHandle
			) {
				const includedServiceUuids = [];

				for (i = 0; i < includedServices.length; i++) {
					if (uuids.length === 0 || uuids.indexOf(includedServices[i].uuid) !== -1) {
						includedServiceUuids.push(includedServices[i].uuid);
					}
				}

				this.emit('includedServicesDiscover', this.address, service.uuid, includedServiceUuids);
			} else {
				this.queueCommand(
					this.readByTypeRequest(
						includedServices[includedServices.length - 1].endHandle + 1,
						service.endHandle,
						GATT_INCLUDE_UUID
					),
					callback
				);
			}
		};

		this.queueCommand(this.readByTypeRequest(service.startHandle, service.endHandle, GATT_INCLUDE_UUID), callback);
	}

	public discoverCharacteristics(serviceUUID: string, characteristicUUIDs: string[]) {
		const service = this.services.get(serviceUUID);
		const characteristics: GattCharacteristic[] = [];

		this.characteristics.set(serviceUUID, this.characteristics.get(serviceUUID) || new Map());
		this.descriptors.set(serviceUUID, this.descriptors.get(serviceUUID) || new Map());

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
				const type = data[1];
				const num = (data.length - 2) / type;

				for (i = 0; i < num; i++) {
					const offset = 2 + i * type;
					const propertiesFlag = data.readUInt8(offset + 2);
					const properties: string[] = [];

					if (propertiesFlag & 0x01) {
						properties.push('broadcast');
					}
					if (propertiesFlag & 0x02) {
						properties.push('read');
					}
					if (propertiesFlag & 0x04) {
						properties.push('writeWithoutResponse');
					}
					if (propertiesFlag & 0x08) {
						properties.push('write');
					}
					if (propertiesFlag & 0x10) {
						properties.push('notify');
					}
					if (propertiesFlag & 0x20) {
						properties.push('indicate');
					}
					if (propertiesFlag & 0x40) {
						properties.push('authenticatedSignedWrites');
					}
					if (propertiesFlag & 0x80) {
						properties.push('extendedProperties');
					}

					characteristics.push({
						startHandle: data.readUInt16LE(offset),
						propertiesFlags: propertiesFlag,
						properties: properties,
						valueHandle: data.readUInt16LE(offset + 3),
						uuid:
							type === 7
								? data.readUInt16LE(offset + 5).toString(16)
								: data
										.slice(offset + 5)
										.slice(0, 16)
										.toString('hex')
										.match(/.{1,2}/g)
										.reverse()
										.join('')
					});
				}
			}

			if (
				opcode !== ATT_OP_READ_BY_TYPE_RESP ||
				characteristics[characteristics.length - 1].valueHandle === service.endHandle
			) {
				const characteristicsDiscovered: GattCharacteristic[] = [];
				for (i = 0; i < characteristics.length; i++) {
					const characteristic = characteristics[i];

					if (i !== 0) {
						characteristics[i - 1].endHandle = characteristics[i].startHandle - 1;
					}

					if (i === characteristics.length - 1) {
						characteristic.endHandle = service.endHandle;
					}

					this.characteristics.get(serviceUUID).set(characteristic.uuid, characteristic);

					if (characteristicUUIDs.length === 0 || characteristicUUIDs.indexOf(characteristic.uuid) !== -1) {
						characteristicsDiscovered.push(characteristic);
					}
				}

				this.emit('characteristicsDiscover', this.address, serviceUUID, characteristicsDiscovered);
				this.emit('characteristicsDiscovered', this.address, serviceUUID, characteristics);
			} else {
				this.queueCommand(
					this.readByTypeRequest(
						characteristics[characteristics.length - 1].valueHandle + 1,
						service.endHandle,
						GATT_CHARAC_UUID
					),
					callback
				);
			}
		};

		this.queueCommand(this.readByTypeRequest(service.startHandle, service.endHandle, GATT_CHARAC_UUID), callback);
	}

	public read(serviceUUID: string, characteristicUUID: string) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];

			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');

				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(characteristic.valueHandle, readData.length), callback);
				} else {
					this.emit('read', this.address, serviceUUID, characteristicUUID, readData);
				}
			} else {
				this.emit('read', this.address, serviceUUID, characteristicUUID, readData);
			}
		};

		this.queueCommand(this.readRequest(characteristic.valueHandle), callback);
	}

	public write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		if (withoutResponse) {
			this.queueCommand(this.writeRequest(characteristic.valueHandle, data, true), null, () => {
				this.emit('write', this.address, serviceUUID, characteristicUUID);
			});
		} else if (data.length + 3 > this.mtu) {
			return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
		} else {
			this.queueCommand(this.writeRequest(characteristic.valueHandle, data, false), (moreData: Buffer) => {
				const opcode = moreData[0];

				if (opcode === ATT_OP_WRITE_RESP) {
					this.emit('write', this.address, serviceUUID, characteristicUUID);
				}
			});
		}
	}

	/* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
	private longWrite(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const limit = this.mtu - 5;

		const prepareWriteCallback = (dataChunk: Buffer) => {
			return (resp: Buffer) => {
				const opcode = resp[0];

				if (opcode !== ATT_OP_PREPARE_WRITE_RESP) {
					// NO-OP
				} else {
					const expectedLength = dataChunk.length + 5;

					if (resp.length !== expectedLength) {
						/* the response should contain the data packet echoed back to the caller */
						// NO-OP
					}
				}
			};
		};

		/* split into prepare-write chunks and queue them */
		let offset = 0;

		while (offset < data.length) {
			const end = offset + limit;
			const chunk = data.slice(offset, end);
			this.queueCommand(
				this.prepareWriteRequest(characteristic.valueHandle, offset, chunk),
				prepareWriteCallback(chunk)
			);
			offset = end;
		}

		/* queue the execute command with a callback to emit the write signal when done */
		this.queueCommand(this.executeWriteRequest(characteristic.valueHandle), (resp: Buffer) => {
			const opcode = resp[0];

			if (opcode === ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
				this.emit('write', this.address, serviceUUID, characteristicUUID);
			}
		});
	}

	public broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_SERVER_CHARAC_CFG_UUID),
			(data: Buffer) => {
				const opcode = data[0];
				if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
					const handle = data.readUInt16LE(2);
					let value = data.readUInt16LE(4);

					if (broadcast) {
						value |= 0x0001;
					} else {
						value &= 0xfffe;
					}

					const valueBuffer = Buffer.alloc(2);
					valueBuffer.writeUInt16LE(value, 0);

					this.queueCommand(this.writeRequest(handle, valueBuffer, false), (moreData: Buffer) => {
						const moreOpcode = moreData[0];

						if (moreOpcode === ATT_OP_WRITE_RESP) {
							this.emit('broadcast', this.address, serviceUUID, characteristicUUID, broadcast);
						}
					});
				}
			}
		);
	}

	public notify(serviceUUID: string, characteristicUUID: string, notify: boolean) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);

		this.queueCommand(
			this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_CLIENT_CHARAC_CFG_UUID),
			(data: Buffer) => {
				const opcode = data[0];
				if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
					const handle = data.readUInt16LE(2);
					let value = data.readUInt16LE(4);

					const useNotify = characteristic.propertiesFlags & 0x10;
					const useIndicate = characteristic.propertiesFlags & 0x20;

					if (notify) {
						if (useNotify) {
							value |= 0x0001;
						} else if (useIndicate) {
							value |= 0x0002;
						}
					} else {
						if (useNotify) {
							value &= 0xfffe;
						} else if (useIndicate) {
							value &= 0xfffd;
						}
					}

					const valueBuffer = Buffer.alloc(2);
					valueBuffer.writeUInt16LE(value, 0);

					this.queueCommand(this.writeRequest(handle, valueBuffer, false), (moreData: Buffer) => {
						const moreOpcode = moreData[0];

						if (moreOpcode === ATT_OP_WRITE_RESP) {
							this.emit('notify', this.address, serviceUUID, characteristicUUID, notify);
						}
					});
				}
			}
		);
	}

	public discoverDescriptors(serviceUUID: string, characteristicUUID: string) {
		const characteristic = this.characteristics.get(serviceUUID).get(characteristicUUID);
		const descriptors: GattDescriptor[] = [];

		this.descriptors.get(serviceUUID).set(characteristicUUID, new Map());

		const callback = (data: Buffer) => {
			const opcode = data[0];
			let i = 0;

			if (opcode === ATT_OP_FIND_INFO_RESP) {
				const num = data[1];

				for (i = 0; i < num; i++) {
					descriptors.push({
						handle: data.readUInt16LE(2 + i * 4 + 0),
						uuid: data.readUInt16LE(2 + i * 4 + 2).toString(16)
					});
				}
			}

			if (opcode !== ATT_OP_FIND_INFO_RESP || descriptors[descriptors.length - 1].handle === characteristic.endHandle) {
				const discoveredDescriptors: GattDescriptor[] = [];
				for (i = 0; i < descriptors.length; i++) {
					discoveredDescriptors.push(descriptors[i]);
					this.descriptors.get(serviceUUID).get(characteristicUUID).set(descriptors[i].uuid, descriptors[i]);
				}

				const allDescriptors = [...this.descriptors.get(serviceUUID).get(characteristicUUID).values()];
				this.emit('descriptorsDiscover', this.address, serviceUUID, characteristicUUID, discoveredDescriptors);
				this.emit('descriptorsDiscovered', this.address, serviceUUID, characteristicUUID, allDescriptors);
			} else {
				this.queueCommand(
					this.findInfoRequest(descriptors[descriptors.length - 1].handle + 1, characteristic.endHandle),
					callback
				);
			}
		};

		this.queueCommand(this.findInfoRequest(characteristic.valueHandle + 1, characteristic.endHandle), callback);
	}

	public readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];
			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');
				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(descriptor.handle, readData.length), callback);
				} else {
					this.emit('valueRead', this.address, serviceUUID, characteristicUUID, descriptorUUID, readData);
				}
			} else {
				this.emit('valueRead', this.address, serviceUUID, characteristicUUID, descriptorUUID, readData);
			}
		};

		this.queueCommand(this.readRequest(descriptor.handle), callback);
	}

	public writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) {
		const descriptor = this.descriptors.get(serviceUUID).get(characteristicUUID).get(descriptorUUID);

		this.queueCommand(this.writeRequest(descriptor.handle, data, false), (moreData: Buffer) => {
			const opcode = moreData[0];

			if (opcode === ATT_OP_WRITE_RESP) {
				this.emit('valueWrite', this.address, serviceUUID, characteristicUUID, descriptorUUID);
			}
		});
	}

	public readHandle(handle: number) {
		let readData = Buffer.alloc(0);

		const callback = (data: Buffer) => {
			const opcode = data[0];
			if (opcode === ATT_OP_READ_RESP || opcode === ATT_OP_READ_BLOB_RESP) {
				readData = Buffer.from(`${readData.toString('hex')}${data.slice(1).toString('hex')}`, 'hex');
				if (data.length === this.mtu) {
					this.queueCommand(this.readBlobRequest(handle, readData.length), callback);
				} else {
					this.emit('handleRead', this.address, handle, readData);
				}
			} else {
				this.emit('handleRead', this.address, handle, readData);
			}
		};

		this.queueCommand(this.readRequest(handle), callback);
	}

	public writeHandle(handle: number, data: Buffer, withoutResponse: boolean) {
		if (withoutResponse) {
			this.queueCommand(this.writeRequest(handle, data, true), null, () => {
				this.emit('handleWrite', this.address, handle);
			});
		} else {
			this.queueCommand(this.writeRequest(handle, data, false), (moreData: Buffer) => {
				const opcode = moreData[0];

				if (opcode === ATT_OP_WRITE_RESP) {
					this.emit('handleWrite', this.address, handle);
				}
			});
		}
	}
}
